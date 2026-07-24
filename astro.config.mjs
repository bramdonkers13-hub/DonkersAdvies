// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.donkersadvies.nl',
	trailingSlash: 'always',
	integrations: [
		sitemap({
			// Pagina's met noindex (bedankt-pagina) horen niet in de sitemap.
			filter: (page) => !page.includes('/bedankt/'),
		}),
	],
});
