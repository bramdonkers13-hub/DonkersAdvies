export type Service = {
	slug: string;
	path: string;
	navLabel: string;
	navBadge: string;
	title: string;
	cardDescription: string;
	tags: [string, string];
	/** Inner markup of a 24x24 viewBox SVG icon (trusted, authored content). */
	icon: string;
};

export const services: Service[] = [
	{
		slug: 'principeverzoek',
		path: '/principeverzoek/',
		navLabel: 'Principeverzoek',
		navBadge: 'Stap 1',
		title: 'Principeverzoek',
		cardDescription:
			'Toets de haalbaarheid van uw bouwplan of functiewijziging vóórdat u de formele procedure start. Donkers Advies stelt het principeverzoek op en regelt de afstemming met de gemeente.',
		tags: ['Haalbaarheid', 'Vooroverleg'],
		icon: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/>',
	},
	{
		slug: 'omgevingsplanactiviteit',
		path: '/omgevingsplanactiviteit/',
		navLabel: 'Omgevingsplanactiviteit',
		navBadge: 'OPA',
		title: 'Omgevingsplanactiviteit (OPA)',
		cardDescription:
			'Past uw activiteit binnen het omgevingsplan maar is een vergunning vereist? Donkers Advies begeleidt de OPA-aanvraag en verzorgt alle benodigde stukken voor het Omgevingsloket.',
		tags: ['OPA', 'Vergunning'],
		icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
	},
	{
		slug: 'buitenplanse-omgevingsplanactiviteit',
		path: '/buitenplanse-omgevingsplanactiviteit/',
		navLabel: 'Buitenplanse omgevingsplanactiviteit',
		navBadge: 'BOPA',
		title: 'Buitenplanse omgevingsplanactiviteit (BOPA)',
		cardDescription:
			'Wijkt uw plan af van het omgevingsplan? Dan is een BOPA nodig. Donkers Advies stelt de ruimtelijke onderbouwing met ETFAL-motivering op en begeleidt de volledige procedure.',
		tags: ['BOPA', 'Ruimtelijke onderbouwing'],
		icon: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
	},
	{
		slug: 'wijziging-omgevingsplan',
		path: '/wijziging-omgevingsplan/',
		navLabel: 'Wijziging omgevingsplan',
		navBadge: 'WOP',
		title: 'Wijziging omgevingsplan (WOP)',
		cardDescription:
			'Voor grootschalige of permanente ontwikkelingen die structurele planologische verankering vereisen. Donkers Advies begeleidt het traject tot en met vaststelling door de gemeenteraad.',
		tags: ['Omgevingsplan', 'Gemeenteraad'],
		icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
	},
];

export function getServiceBySlug(slug: string): Service | undefined {
	return services.find((s) => s.slug === slug);
}
