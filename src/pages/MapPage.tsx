import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { MapControls } from "@/components/map/controls";
import { Map as WorldMap } from "@/components/map/map";
import { MapMarker, MarkerContent, MarkerPopup } from "@/components/map/marker";
import { getAmostraMarker } from "@/features/amostras/coordinates";
import { type Amostra, fetchAmostras } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function MapPage() {
	const {
		data: amostras,
		isLoading,
		isError,
		error,
	} = useQuery<Amostra[], Error>({
		queryKey: queryKeys.amostras(),
		queryFn: () => fetchAmostras(),
	});

	const markers = amostras?.map(getAmostraMarker).filter((marker) => marker !== null) ?? [];

	return (
		<Layout contentClassName="max-w-none items-stretch justify-stretch p-4">
			<div className="flex min-h-0 w-full flex-1 flex-col">
				<div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-1 shadow-2xl shadow-black/30">
					<WorldMap
						center={[-39.492882, -5.371759]}
						zoom={6}
						loading={isLoading}
						className="overflow-hidden rounded-lg"
					>
						<MapControls position="top-right" showZoom showCompass showLocate showFullscreen />
						{markers.map((amostra) => (
							<MapMarker key={amostra.id} longitude={amostra.longitude} latitude={amostra.latitude}>
								<MarkerContent>
									<div className="size-4 rounded-full border-2 border-white bg-emerald-500 shadow-lg shadow-emerald-950/50" />
								</MarkerContent>
								<MarkerPopup
									closeButton
									className="border-slate-600 bg-slate-800 text-slate-100 shadow-xl shadow-black/30"
								>
									<div className="space-y-2 p-2 text-sm">
										<p className="font-semibold">{amostra.proponente || `Amostra ${amostra.id}`}</p>
										<p className="text-muted-foreground">
											{amostra.municipio}
											{amostra.uf ? ` - ${amostra.uf}` : ""}
										</p>
										<p className="text-muted-foreground">
											{amostra.latitude.toFixed(6)}, {amostra.longitude.toFixed(6)}
										</p>
										<Link
											to={`/amostras/${amostra.id}`}
											className="mt-1 block text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
										>
											Ver detalhes →
										</Link>
									</div>
								</MarkerPopup>
							</MapMarker>
						))}
					</WorldMap>
				</div>
				{isError && <p className="mt-3 shrink-0 text-sm text-red-400">{error.message}</p>}
			</div>
		</Layout>
	);
}
