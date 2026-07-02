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
