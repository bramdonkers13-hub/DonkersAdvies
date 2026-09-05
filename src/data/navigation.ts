/**
 * Single source of truth for the main menu. Add a menu item here and it
 * appears in the header nav automatically — the "Diensten" dropdown itself
 * is generated from data/services.ts.
 */
export const dienstenDropdownHref = '/#diensten';

export const primaryNav: { label: string; href: string }[] = [
	{ label: 'Over Donkers Advies', href: '/#about' },
	{ label: 'Blog', href: '/blog/' },
];

export const navCta = { label: 'Contact', href: '/#contact' };

export const footerNav: { label: string; href: string }[] = [
	{ label: 'Blog', href: '/blog/' },
	{ label: 'Over Donkers Advies', href: '/#about' },
	{ label: 'Werkwijze', href: '/#werkwijze' },
	{ label: 'Waarom Donkers', href: '/#waarom' },
	{ label: 'Veelgestelde vragen', href: '/#faq' },
	{ label: 'Contact', href: '/#contact' },
];

export const footerLegalNav: { label: string; href: string }[] = [
	{ label: 'Privacyverklaring', href: '/privacy/' },
	{ label: 'Cookieverklaring', href: '/cookies/' },
];
