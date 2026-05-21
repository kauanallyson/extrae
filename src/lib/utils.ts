import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	if (error) {
		try {
			return JSON.stringify(error) ?? String(error);
		} catch {
			return String(error);
		}
	}
	return "Erro desconhecido.";
}
