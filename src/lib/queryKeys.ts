export const queryKeys = {
	amostras: ["amostras"] as const,
	amostra: (id: number) => ["amostra", id] as const,
	stats: (municipio?: string) => ["stats", municipio ?? null] as const,
	municipios: ["municipios"] as const,
	avaliadores: ["avaliadores"] as const,
	me: ["me"] as const,
};
