export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBrl(value: number): string {
	return brl.format(value);
}

const decimalFormat = new Intl.NumberFormat("pt-BR", {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatDecimal(value: number): string {
	return decimalFormat.format(value);
}

const dateFormat = new Intl.DateTimeFormat("pt-BR");

export function formatDate(value: string | null | undefined): string {
	if (!value) return "-";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? value : dateFormat.format(d);
}
