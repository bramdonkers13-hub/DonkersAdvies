import { OGImageRoute } from 'astro-og-canvas';

const pages = {
	default: {
		title: 'Donkers Advies',
		description: 'Ruimtelijk adviesbureau gespecialiseerd in de Omgevingswet.',
	},
	home: {
		title: 'Donkers Advies | Ruimtelijk adviesbureau Omgevingswet',
		description:
			'Ruimtelijk adviesbureau gespecialiseerd in de Omgevingswet. Donkers Advies begeleidt principeverzoeken, OPA, BOPA en wijzigingen van het omgevingsplan.',
	},
	principeverzoek: {
		title: 'Principeverzoek opstellen en indienen bij de gemeente',
		description:
			'Toets of de gemeente meewerkt voordat u investeert in onderzoeken. Ik stel uw principeverzoek op, dien het in en begeleid het tot de reactie van de gemeente.',
	},
	omgevingsplanactiviteit: {
		title: 'OPA aanvragen: omgevingsvergunning en begeleiding',
		description:
			'Past uw plan binnen het omgevingsplan maar is er een vergunning nodig? Ik stel uw OPA-aanvraag op en begeleid de procedure tot de vergunning er ligt.',
	},
	'buitenplanse-omgevingsplanactiviteit': {
		title: 'BOPA aanvragen: onderbouwing, procedure en kosten',
		description:
			'Wijkt uw plan af van het omgevingsplan? Ik stel de ruimtelijke onderbouwing op en begeleid uw BOPA-aanvraag tot het besluit, met kennis van de beoordeling.',
	},
	'wijziging-omgevingsplan': {
		title: 'Omgevingsplan wijzigen: procedure en begeleiding',
		description:
			'Moet het omgevingsplan worden gewijzigd voor uw plan? Ik verzorg de motivering, de planregels en de afstemming, en begeleid het traject tot de vaststelling.',
	},
	'ruimtelijke-onderbouwing': {
		title: 'Ruimtelijke onderbouwing laten opstellen',
		description:
			'Heeft de gemeente gezegd dat u een ruimtelijke onderbouwing nodig heeft? Ik stel het document op, regel de onderzoeken en begeleid uw aanvraag tot het besluit.',
	},
};

export const { getStaticPaths, GET } = await OGImageRoute({
	param: 'route',
	pages,
	getImageOptions: (_path, page: (typeof pages)[keyof typeof pages]) => ({
		title: page.title,
		description: page.description,
		logo: {
			path: './src/assets/images/logo-wit.png',
			size: [140],
		},
		bgGradient: [
			[10, 36, 24],
			[22, 58, 40],
		],
		border: { color: [69, 117, 84], width: 8, side: 'block-end' },
		padding: 80,
		font: {
			title: { color: [255, 255, 255], size: 60, lineHeight: 1.3, families: ['Sora'] },
			description: { color: [154, 180, 158], size: 32, lineHeight: 1.5, families: ['Manrope'] },
		},
		fonts: ['./src/assets/fonts/Sora-Variable.ttf', './src/assets/fonts/Manrope-Variable.ttf'],
	}),
});
