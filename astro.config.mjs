// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';

// Leest publishedDate/updatedDate rechtstreeks uit de blog-frontmatter (geen astro:content
// beschikbaar in astro.config.mjs) zodat de sitemap per artikel een lastmod kan meegeven.
const blogDir = new URL('./src/content/blog/', import.meta.url);
/** @type {Record<string, string>} */
const blogLastmod = {};
for (const file of fs.readdirSync(blogDir)) {
	if (!file.endsWith('.md')) continue;
	const frontmatter = fs.readFileSync(new URL(file, blogDir), 'utf8');
	const match = frontmatter.match(/^updatedDate:\s*(\S+)/m);
	if (match) {
		blogLastmod[`/blog/${file.replace(/\.md$/, '')}/`] = match[1];
	}
}

// https://astro.build/config
export default defineConfig({
	site: 'https://www.donkersadvies.nl',
	trailingSlash: 'always',
	integrations: [
		sitemap({
			// Pagina's met noindex (bedankt-pagina) horen niet in de sitemap.
			filter: (page) => !page.includes('/bedankt/'),
			serialize(item) {
				const lastmod = blogLastmod[new URL(item.url).pathname];
				return lastmod ? { ...item, lastmod } : item;
			},
		}),
	],
});
