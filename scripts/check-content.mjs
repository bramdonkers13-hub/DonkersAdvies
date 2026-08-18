/**
 * Contentcontroles die de Astro-build zelf niet uitvoert.
 *
 * De build valideert de frontmatter tegen het Zod-schema in src/content.config.ts,
 * maar kijkt niet of de waarden onderling kloppen: of een categorie een filterchip
 * heeft, of een gerelateerde slug bestaat, of een inhoudsopgave-anchor ergens landt,
 * en of interne links naar een bestaande route wijzen. Dat controleert dit script.
 *
 * Draait zonder dependencies en zonder netwerk, in ruim onder een seconde.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BLOG_DIR = 'src/content/blog';
const PAGES_DIR = 'src/pages';
const BLOG_INDEX = 'src/pages/blog/index.astro';

const errors = [];
const fail = (file, message) => errors.push({ file, message });

// ─── Posts inlezen ──────────────────────────────────────────────

const postFiles = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md'));
const slugs = new Set(postFiles.map((f) => f.replace(/\.md$/, '')));

/** Splitst een postbestand in frontmatter en body. */
function splitPost(raw) {
	const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	return match ? { frontmatter: match[1], body: match[2] } : null;
}

const posts = [];
for (const file of postFiles) {
	const parts = splitPost(readFileSync(join(BLOG_DIR, file), 'utf8'));
	if (!parts) {
		fail(`${BLOG_DIR}/${file}`, 'geen leesbare frontmatter gevonden');
		continue;
	}
	posts.push({ slug: file.replace(/\.md$/, ''), file: `${BLOG_DIR}/${file}`, ...parts });
}

// ─── 1. Categorie moet een filterchip hebben ────────────────────

const indexSource = readFileSync(BLOG_INDEX, 'utf8');
const categoriesBlock = indexSource.match(/const categories = \[([\s\S]*?)\n\];/);
if (!categoriesBlock) {
	fail(BLOG_INDEX, 'kon de categories-array niet lezen (is de opzet gewijzigd?)');
}
const chipIds = new Set(
	[...(categoriesBlock?.[1] ?? '').matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1])
);

for (const post of posts) {
	const category = post.frontmatter.match(/^category:\s*"([^"]+)"/m)?.[1];
	if (!category) {
		fail(post.file, 'kon het veld category niet lezen');
		continue;
	}
	if (chipIds.size && !chipIds.has(category)) {
		fail(post.file, `category "${category}" heeft geen filterchip in ${BLOG_INDEX}`);
	}
}

// ─── 2. relatedSlugs: precies 3, bestaand, niet naar zichzelf ───

for (const post of posts) {
	const rawList = post.frontmatter.match(/^relatedSlugs:\s*\[([^\]]*)\]/m)?.[1];
	if (rawList === undefined) {
		fail(post.file, 'kon het veld relatedSlugs niet lezen');
		continue;
	}
	const related = [...rawList.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

	if (related.length !== 3) {
		fail(post.file, `relatedSlugs bevat ${related.length} slugs, verwacht precies 3`);
	}
	for (const slug of related) {
		if (!slugs.has(slug)) fail(post.file, `relatedSlugs verwijst naar onbekende post "${slug}"`);
		if (slug === post.slug) fail(post.file, 'relatedSlugs verwijst naar de post zelf');
	}
}

// ─── 3. Elk toc-anchor moet een kop met dat id hebben ───────────

for (const post of posts) {
	const tocBlock = post.frontmatter.match(/^toc:\r?\n([\s\S]*?)(?=\r?\n[^\s#-])/m)?.[1];
	if (!tocBlock) {
		fail(post.file, 'kon het veld toc niet lezen');
		continue;
	}
	const anchors = [...tocBlock.matchAll(/anchor:\s*"([^"]+)"/g)].map((m) => m[1]);
	if (anchors.length === 0) {
		fail(post.file, 'toc bevat geen enkel anchor');
		continue;
	}
	const ids = new Set([...post.body.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
	for (const anchor of anchors) {
		if (!ids.has(anchor)) {
			fail(post.file, `toc-anchor "${anchor}" heeft geen kop met id="${anchor}" in de body`);
		}
	}
}

// ─── 4. Interne links: bestaande route, afsluitende slash ───────

/** Alle routes die de site daadwerkelijk genereert. */
function collectRoutes() {
	const routes = new Set(['/']);
	const walk = (dir, prefix) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(path, `${prefix}${entry.name}/`);
			} else if (entry.name.endsWith('.astro')) {
				const name = entry.name.replace(/\.astro$/, '');
				if (name.startsWith('[')) continue; // dynamische route, apart toegevoegd
				routes.add(name === 'index' ? prefix || '/' : `${prefix}${name}/`);
			}
		}
	};
	walk(PAGES_DIR, '/');
	for (const slug of slugs) routes.add(`/blog/${slug}/`);
	return routes;
}

const routes = collectRoutes();

/** Bestanden waarin interne links kunnen staan. */
function sourceFiles(dir) {
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...sourceFiles(path));
		else if (/\.(astro|md)$/.test(entry.name)) found.push(path);
	}
	return found;
}

const LINK_PATTERNS = [
	/href="(\/[^"{}]*)"/g, // HTML- en JSX-attributen
	/\]\((\/[^)\s]*)\)/g, // markdownlinks
];

for (const file of sourceFiles('src')) {
	const source = readFileSync(file, 'utf8');
	const seen = new Set();

	for (const pattern of LINK_PATTERNS) {
		for (const [, href] of source.matchAll(pattern)) {
			if (seen.has(href)) continue;
			seen.add(href);

			const [path] = href.split('#');
			if (path === '') continue; // puur een anchor, bv. "/#contact" op dezelfde pagina
			if (path.startsWith('/_') || path.includes('.')) continue; // assets in public/

			if (!path.endsWith('/')) {
				fail(file, `interne link "${href}" mist een afsluitende slash (trailingSlash: 'always')`);
				continue;
			}
			if (!routes.has(path)) {
				fail(file, `interne link "${href}" wijst naar een route die niet bestaat`);
			}
		}
	}
}

// ─── Rapportage ─────────────────────────────────────────────────

if (errors.length === 0) {
	console.log(`✓ Contentcontrole geslaagd: ${posts.length} posts, ${routes.size} routes.`);
	process.exit(0);
}

console.error(`✗ Contentcontrole: ${errors.length} probleem(en) gevonden.\n`);
const byFile = new Map();
for (const { file, message } of errors) {
	if (!byFile.has(file)) byFile.set(file, []);
	byFile.get(file).push(message);
}
for (const [file, messages] of byFile) {
	console.error(file);
	for (const message of messages) console.error(`  - ${message}`);
	console.error('');
}
process.exit(1);
