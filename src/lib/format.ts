export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBrlCents(cents: number): string {
	return brl.format(cents / 100);
}

const decimalFromCentsFormat = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatDecimalFromCents(value: number): string {
	return decimalFromCentsFormat.format(value / 100);
}

const dateFormat = new Intl.DateTimeFormat("pt-BR");

export function formatDate(value: string | null | undefined): string {
	if (!value) return "-";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? value : dateFormat.format(d);
}
