import type { AmostrasStats } from "@/lib/api";

export type Outlier = { id: number; valor: number };

export type Serie = { nome: string; stats: AmostrasStats; outliers?: Outlier[] };

export type Linha = {
	nome: string;
	caixa: [number, number];
	bigodes: [number, number];
	mediana: number;
	cor: string;
	outliers: Outlier[];
	stats: AmostrasStats;
};

const CORES = ["var(--chart-1)", "var(--chart-2)"];

// Cada série vira uma barra-faixa de Q1 a Q3; a mediana é o corte desenhado dentro
// da caixa. Os bigodes vão até o menor e o maior valor dentro dos limites de Tukey;
// o que fica fora vira ponto. Séries sem os cinco números são puladas.
export function distribuicaoLinhas(series: Serie[]): {
	linhas: Linha[];
	dominio: [number, number];
} {
	const linhas: Linha[] = [];
	for (const [indice, { nome, stats, outliers = [] }] of series.entries()) {
		const { min, max, median, q1, q3, lowerFence, upperFence } = stats;
		if (min == null || max == null || median == null || q1 == null || q3 == null) continue;
		const inicio = lowerFence != null ? Math.max(min, lowerFence) : min;
		const fim = upperFence != null ? Math.min(max, upperFence) : max;
		linhas.push({
			nome,
			caixa: [q1, q3],
			bigodes: [q3 - inicio, fim - q3],
			mediana: median,
			cor: CORES[indice % CORES.length],
			outliers,
			stats,
		});
	}

	if (linhas.length === 0) return { linhas, dominio: [0, 0] };

	// O eixo cobre só a faixa dos dados — começar em zero espremeria as caixas num canto.
	// As bordas caem na centena redonda mais próxima fora dos dados.
	const menor = Math.min(...linhas.map((linha) => linha.stats.min ?? 0));
	const maior = Math.max(...linhas.map((linha) => linha.stats.max ?? 0));
	return { linhas, dominio: [Math.floor(menor / 100) * 100, Math.ceil(maior / 100) * 100] };
}
