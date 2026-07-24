import { business } from '../data/business';
import { services } from '../data/services';

/** JSON-LD-builders. Elke pagina verzamelt de schema's die het nodig heeft
 * in een array en rendert die als één <script type="application/ld+json">. */

export function organizationSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: business.name,
		url: business.url,
		email: business.email,
		telephone: business.phoneIntl,
		identifier: business.kvk,
		description:
			'Ruimtelijk adviesbureau gespecialiseerd in de Omgevingswet. Donkers Advies begeleidt particulieren en ondernemers bij principeverzoeken, omgevingsvergunningen (OPA en BOPA) en wijzigingen van het omgevingsplan.',
		address: {
			'@type': 'PostalAddress',
			addressCountry: 'NL',
			addressRegion: 'Noord-Brabant',
		},
		areaServed: business.areaServed,
	};
}

export function professionalServiceSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfessionalService',
		name: business.name,
		url: business.url,
		email: business.email,
		telephone: business.phoneIntl,
		description:
			'Specialist in ruimtelijke ordening en de Omgevingswet. Begeleiding bij principeverzoeken, OPA, BOPA en wijzigingen van het omgevingsplan.',
		serviceType: 'Ruimtelijke ordening advies',
		areaServed: { '@type': 'Country', name: 'Nederland' },
		hasOfferCatalog: {
			'@type': 'OfferCatalog',
			name: 'Diensten ruimtelijke ordening',
			itemListElement: services.map((s) => ({
				'@type': 'Offer',
				itemOffered: {
					'@type': 'Service',
					name: s.title,
					url: business.url + s.path,
				},
			})),
		},
	};
}

export function websiteSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		url: business.url,
		name: business.name,
		description: 'Ruimtelijk adviesbureau gespecialiseerd in de Omgevingswet',
	};
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbSchema(items: BreadcrumbItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.name,
			item: business.url + item.path,
		})),
	};
}

export type FaqItem = { question: string; answer: string };

export function faqSchema(items: FaqItem[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer },
		})),
	};
}

export function serviceSchema(params: { name: string; description: string; path: string }) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Service',
		name: params.name,
		description: params.description,
		provider: {
			'@type': 'Organization',
			name: business.name,
			url: business.url,
			email: business.email,
			identifier: business.kvk,
		},
		serviceType: 'Ruimtelijke ordening advies',
		areaServed: { '@type': 'Country', name: 'Nederland' },
	};
}

export function blogSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Blog',
		name: `${business.name} Blog`,
		description:
			'Praktische kennis over BOPA, principeverzoeken, omgevingsvergunningen (OPA) en wijzigingen van het omgevingsplan.',
		url: business.url + '/blog/',
		publisher: {
			'@type': 'Organization',
			name: business.name,
			url: business.url,
			email: business.email,
			identifier: business.kvk,
		},
	};
}

export function blogPostingSchema(params: {
	headline: string;
	description: string;
	image: string;
	datePublished: string;
	dateModified: string;
	wordCount: number;
	timeRequired: string;
	path: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: params.headline,
		description: params.description,
		image: params.image,
		datePublished: params.datePublished,
		dateModified: params.dateModified,
		inLanguage: 'nl-NL',
		wordCount: params.wordCount,
		timeRequired: params.timeRequired,
		mainEntityOfPage: { '@type': 'WebPage', '@id': business.url + params.path },
		author: { '@type': 'Organization', name: business.name, url: business.url },
		publisher: {
			'@type': 'Organization',
			name: business.name,
			url: business.url,
			logo: { '@type': 'ImageObject', url: business.url + '/brand_assets/favicon-192x192.png' },
		},
	};
}
