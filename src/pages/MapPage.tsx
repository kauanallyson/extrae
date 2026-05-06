import { Layout } from "@/components/Layout";
import { MapControls, Map as WorldMap } from "@/components/ui/map";

export function MapPage() {
	return (
		<Layout>
			<div className="h-120 w-full">
				<WorldMap center={[-39.492882, -5.371759]} zoom={6}>
					<MapControls
						position="top-right"
						showZoom
						showCompass
						showLocate
						showFullscreen
					/>
				</WorldMap>
			</div>
		</Layout>
	);
}
