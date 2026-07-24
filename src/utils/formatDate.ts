const formatter = new Intl.DateTimeFormat('nl-NL', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/** bv. "16 juni 2026" */
export function formatDateNL(date: Date): string {
	return formatter.format(date);
}
