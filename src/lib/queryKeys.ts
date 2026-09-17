import type { AmostrasFilters } from "@/lib/api";

export const queryKeys = {
	amostras: (filters?: AmostrasFilters) =>
		filters ? (["amostras", filters] as const) : (["amostras"] as const),
	amostra: (id: number) => ["amostra", id] as const,
	stats: (filters?: AmostrasFilters) =>
		filters ? (["stats", filters] as const) : (["stats"] as const),
	municipios: ["municipios"] as const,
	avaliadores: ["avaliadores"] as const,
	me: ["me"] as const,
};
