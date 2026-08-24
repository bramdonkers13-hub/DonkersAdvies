/**
 * Faalt de build als een <title> boven 60 tekens staat of een meta description
 * boven 158 tekens, gemeten op de uiteindelijke dist/-HTML. Dat werkt ongeacht
 * of de brontekst uit blog-frontmatter komt of uit een const in een .astro-
 * pagina, en vangt ook title/description op die pas in BaseLayout worden
 * samengesteld.
 *
 * Draait na `astro build`, zonder dependencies en zonder netwerk.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = 'dist';
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 158;

// Bewuste, met de eigenaar afgestemde uitzonderingen. Alleen hier toevoegen
// na expliciete instructie, met de reden erbij.
const TITLE_EXCEPTIONS = {
	'/wijziging-omgevingsplan/':
		'Titel bevat bewust "bestemmingsplan" naast "omgevingsplan", voor een zoekopdracht met 855 vertoningen (taak 6); expliciet zo gekozen ondanks de 60-tekensgrens.',
};

function htmlFiles(dir, prefix = '/') {
	const found = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			found.push(...htmlFiles(path, `${prefix}${entry.name}/`));
		} else if (entry.name.endsWith('.html')) {
			const route = entry.name === 'index.html' ? prefix || '/' : `${prefix}${entry.name}`;
			found.push({ path, route });
		}
	}
	return found;
}

const errors = [];

for (const { path, route } of htmlFiles(DIST_DIR)) {
	const html = readFileSync(path, 'utf8');

	const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim();
	if (title && !TITLE_EXCEPTIONS[route] && title.length > TITLE_MAX) {
		errors.push(`${route}: title is ${title.length} tekens (max ${TITLE_MAX}): "${title}"`);
	}

	const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
	if (description && description.length > DESCRIPTION_MAX) {
		errors.push(
			`${route}: description is ${description.length} tekens (max ${DESCRIPTION_MAX}): "${description.slice(0, 70)}…"`
		);
	}
}

if (errors.length === 0) {
	console.log('✓ SEO-lengtecontrole geslaagd: geen title boven 60 of description boven 158 tekens.');
	process.exit(0);
}

console.error(`✗ SEO-lengtecontrole: ${errors.length} probleem(en) gevonden.\n`);
for (const error of errors) console.error(`  - ${error}`);
process.exit(1);
