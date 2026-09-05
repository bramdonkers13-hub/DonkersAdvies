const formatter = new Intl.DateTimeFormat('nl-NL', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/** bv. "16 juni 2026" */
export function formatDateNL(date: Date): string {
	return formatter.format(date);
}

/** Machineleesbare datum voor het datetime-attribuut van <time>, bv. "2026-06-16". */
export function isoDate(date: Date): string {
	return date.toISOString().slice(0, 10);
}
