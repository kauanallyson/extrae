export const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
export const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
export const cepRegex = /^\d{2}\.\d{3}-\d{3}$/;

export function maskCep(value: string): string {
	const digits = value.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
	return `${digits.slice(0, 2)}.${digits.slice(2, 5)}-${digits.slice(5)}`;
}
export const dddRegex = /^\d{2}$/;
export const phoneRegex = /^\d{5}-\d{3,4}$/;

export function maskTelefone(value: string): string {
	const digits = value.replace(/\D/g, "").slice(0, 9);
	if (digits.length <= 5) return digits;
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export const dataReferenciaRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export function maskDataReferencia(value: string): string {
	const digits = value.replace(/\D/g, "").slice(0, 8);
	if (digits.length <= 2) return digits;
	if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
	return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export const coordenadaDmsRegex = /^\d+º\d+'\d+(?:,\d+)?"$/;
export const coordenadaDmsMessage = "Use o formato XXºYY'ZZ,ZZZ\" (ex.: 05º39'05,497\").";

export function normalizeCoordenadaDms(value: string): string {
	return value
		.replace(/[°]/g, "º")
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"');
}

export function maskDecimalDuasCasas(value: string): string {
	let digitsAndComma = value.replace(/[^\d,]/g, "");

	const firstComma = digitsAndComma.indexOf(",");
	if (firstComma === -1) return digitsAndComma;

	const intPart = digitsAndComma.slice(0, firstComma);
	const decPart = digitsAndComma.slice(firstComma + 1).replace(/,/g, "");
	digitsAndComma = `${intPart},${decPart.slice(0, 2)}`;

	return digitsAndComma;
}
