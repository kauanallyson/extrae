import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import {
	MapControls,
	MapMarker,
	MarkerContent,
	MarkerPopup,
	Map as WorldMap,
} from "@/components/ui/map";
import { type Amostra, fetchAmostras } from "@/lib/api";

type AmostraMarker = Amostra & {
	latitude: number;
	longitude: number;
};

function degreesToDecimal(
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
	const absoluteDecimal =
		Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600;
	const sign = degrees < 0 || direction === "S" || direction === "W" ? -1 : 1;

	return sign * absoluteDecimal;
}

function isValidCoordinate(latitude: number, longitude: number) {
	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

function getAmostraMarker(amostra: Amostra): AmostraMarker | null {
	const latitude = degreesToDecimal(amostra.coordenadaS, "S");
	const longitude = degreesToDecimal(amostra.coordenadaW, "W");

	if (
		latitude === null ||
		longitude === null ||
		!isValidCoordinate(latitude, longitude)
	) {
		return null;
	}

	return { ...amostra, latitude, longitude };
}

export function MapPage() {
	const {
		data: amostras,
		isLoading,
		isError,
		error,
	} = useQuery<Amostra[], Error>({
		queryKey: ["amostras"],
		queryFn: fetchAmostras,
	});

	const markers =
		amostras?.map(getAmostraMarker).filter((marker) => marker !== null) ??
		[];

	return (
		<Layout>
			<div className="h-[calc(100dvh-8rem)] w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10">
				<WorldMap
					center={[-39.492882, -5.371759]}
					zoom={6}
					loading={isLoading}
				>
					<MapControls
						position="top-right"
						showZoom
						showCompass
						showLocate
						showFullscreen
					/>
					{markers.map((amostra) => (
						<MapMarker
							key={amostra.id}
							longitude={amostra.longitude}
							latitude={amostra.latitude}
						>
							<MarkerContent>
								<div className="size-4 rounded-full border-2 border-white bg-emerald-500 shadow-lg shadow-emerald-950/50" />
							</MarkerContent>
							<MarkerPopup closeButton>
								<div className="space-y-1 text-sm p-2">
									<p className="font-semibold">
										{amostra.proponente ||
											`Amostra ${amostra.id}`}
									</p>
									<p className="text-muted-foreground">
										{amostra.municipio}
										{amostra.uf ? ` - ${amostra.uf}` : ""}
									</p>
									<p className="text-muted-foreground">
										{amostra.latitude.toFixed(6)},{" "}
										{amostra.longitude.toFixed(6)}
									</p>
								</div>
							</MarkerPopup>
						</MapMarker>
					))}
				</WorldMap>
			</div>
			{isError && (
				<p className="mt-3 text-sm text-red-400">{error.message}</p>
			)}
		</Layout>
	);
}
