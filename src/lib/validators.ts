export const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
export const cepRegex = /^\d{5}-\d{3}$/;

export function maskCep(value: string): string {
	const digits = value.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 5) return digits;
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}
export const dddRegex = /^\d{2}$/;
export const phoneRegex = /^\d{5}-\d{3,4}$/;

export function maskTelefone(value: string): string {
	const digits = value.replace(/\D/g, "").slice(0, 9);
	if (digits.length <= 5) return digits;
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function normalizeCoordenadaDms(value: string): string {
	return value.replace(/[°]/g, "º").replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
}

export function maskDecimal(value: string): string {
	const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
	if (!digits) return "";
	const padded = digits.padStart(3, "0");
	const decDigits = padded.slice(-2);
	const intDigits = padded.slice(0, -2).replace(/^0+(?=\d)/, "") || "0";
	const groupedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	return `${groupedInt},${decDigits}`;
}

export function unmaskDecimal(value: string): string {
	return value.replace(/\./g, "").replace(",", ".");
}
