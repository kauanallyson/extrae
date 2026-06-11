import type { AmostrasFilters } from "@/lib/api";

export const queryKeys = {
	amostras: (filters?: AmostrasFilters) =>
		filters && Object.keys(filters).length > 0
			? (["amostras", filters] as const)
			: (["amostras"] as const),
	amostra: (id: number) => ["amostra", id] as const,
	avaliadores: ["avaliadores"] as const,
};
