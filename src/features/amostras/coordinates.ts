import type { Amostra } from "@/lib/api";

export type AmostraMarker = Amostra & {
	latitude: number;
	longitude: number;
};

export function degreesToDecimal(
	value: string | null | undefined,
	hemisphere?: "N" | "S" | "E" | "W",
) {
	if (!value) return null;

	const normalized = value.trim().toUpperCase().replaceAll(",", ".");
	const direction = normalized.match(/[NSEW]/)?.[0] ?? hemisphere;
	const parts = normalized.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];

	if (!parts.length || parts.some((part) => Number.isNaN(part))) {
		return null;
	}

	const [degrees, minutes = 0, seconds = 0] = parts;
	const absoluteDecimal = Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600;
	const sign = degrees < 0 || direction === "S" || direction === "W" ? -1 : 1;

	return sign * absoluteDecimal;
}

export function isValidCoordinate(latitude: number, longitude: number) {
	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

export function getAmostraMarker(amostra: Amostra): AmostraMarker | null {
	const latitude = degreesToDecimal(amostra.coordenadaS, "S");
	const longitude = degreesToDecimal(amostra.coordenadaW, "W");

	if (latitude === null || longitude === null || !isValidCoordinate(latitude, longitude)) {
		return null;
	}

	return { ...amostra, latitude, longitude };
}
