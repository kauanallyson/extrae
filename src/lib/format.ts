export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const dateFormat = new Intl.DateTimeFormat("pt-BR");

export function formatDate(value: string | null | undefined): string {
	if (!value) return "-";
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? value : dateFormat.format(d);
}
