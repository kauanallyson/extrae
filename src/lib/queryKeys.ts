export const queryKeys = {
	amostras: ["amostras"] as const,
	amostra: (id: number) => ["amostra", id] as const,
	avaliadores: ["avaliadores"] as const,
	me: ["me"] as const,
};
