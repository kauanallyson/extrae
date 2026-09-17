import type { AmostrasStats } from "@/lib/api";

export type Serie = { nome: string; stats: AmostrasStats };

export type Linha = {
	nome: string;
	caixa: [number, number];
	bigodes: [number, number];
	mediana: number;
	cor: string;
	stats: AmostrasStats;
};

const CORES = ["var(--chart-1)", "var(--chart-2)"];

// Cada série vira uma barra-faixa de Q1 a Q3; a mediana é o corte desenhado dentro
// da caixa e os bigodes são um ErrorBar assimétrico preso ao fim da barra (Q3),
// indo do menor ao maior valor observado. Séries sem os cinco números são puladas.
export function distribuicaoLinhas(series: Serie[]): {
	linhas: Linha[];
	dominio: [number, number];
} {
	const linhas: Linha[] = [];
	for (const [indice, { nome, stats }] of series.entries()) {
		const { min, max, median, q1, q3 } = stats;
		if (min == null || max == null || median == null || q1 == null || q3 == null) continue;
		linhas.push({
			nome,
			caixa: [q1, q3],
			bigodes: [q3 - min, max - q3],
			mediana: median,
			cor: CORES[indice % CORES.length],
			stats,
		});
	}

	if (linhas.length === 0) return { linhas, dominio: [0, 0] };

	// O eixo cobre só a faixa dos dados — começar em zero espremeria as caixas num canto.
	const menor = Math.min(...linhas.map((linha) => linha.stats.min ?? 0));
	const maior = Math.max(...linhas.map((linha) => linha.stats.max ?? 0));
	const folga = (maior - menor || maior * 0.1 || 1) * 0.08;
	return { linhas, dominio: [menor - folga, maior + folga] };
}
