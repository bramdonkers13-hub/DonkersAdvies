import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
	schema: ({ image }) =>
		z.object({
			/** Voor de <title>-tag: kort, keyword-eerst. */
			metaTitle: z.string(),
			/** Redactionele titel: h1, og:title, kaarten, JSON-LD headline. */
			title: z.string(),
			/** Meta description + OG + Twitter + FAQPage-zoekexcerpt. */
			description: z.string(),
			/** Korte tekst op de blogkaart (post-card). */
			cardExcerpt: z.string(),
			/** Introductiealinea boven de inhoudsopgave (.post-lead). */
			lead: z.string(),
			/** Inhoudsopgave: label + anchor die overeenkomt met een <h2 id="…"> in de body. */
			toc: z.array(z.object({ label: z.string(), anchor: z.string() })),
			category: z.string(),
			categoryLabel: z.string(),
			/** Zoekwoorden voor de client-side blogfilter. */
			searchTags: z.array(z.string()),
			image: image(),
			imageAlt: z.string(),
			publishedDate: z.coerce.date(),
			updatedDate: z.coerce.date(),
			readingTimeMinutes: z.number(),
			wordCount: z.number(),
			/** Slugs van 3 gerelateerde artikelen, in weergavevolgorde. */
			relatedSlugs: z.array(z.string()),
			faq: z.array(z.object({ question: z.string(), answer: z.string() })),
			/** Label in de zichtbare broodkruimel én de BreadcrumbList-JSON-LD. */
			breadcrumbLabel: z.string(),
			ctaTitle: z.string(),
			ctaDescription: z.string(),
			ctaButtonLabel: z.string(),
			ctaButtonHref: z.string(),
			/** Extra alinea ná de CTA-knop (alleen gebruikt door enkele posts). */
			ctaExtra: z.string().optional(),
		}),
});

export const collections = { blog };
