import { business } from '../data/business';

/** Bouwt een absolute URL vanaf een site-relatief pad, voor canonical/OG/JSON-LD. */
export function absoluteUrl(path: string, site: URL | undefined): string {
	const base = site?.toString() ?? business.url + '/';
	return new URL(path, base).toString();
}

/** 1200×630 fallback OG-afbeelding, gegenereerd door src/pages/open-graph/[...route].ts. */
export const defaultOgImage = '/open-graph/default.png';
