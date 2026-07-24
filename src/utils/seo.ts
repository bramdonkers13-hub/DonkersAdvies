import { business } from '../data/business';

/** Bouwt een absolute URL vanaf een site-relatief pad, voor canonical/OG/JSON-LD. */
export function absoluteUrl(path: string, site: URL | undefined): string {
	const base = site?.toString() ?? business.url + '/';
	return new URL(path, base).toString();
}

export const defaultOgImage = '/brand_assets/favicon-192x192.png';
