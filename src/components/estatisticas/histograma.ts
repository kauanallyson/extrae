export type SerieHistograma = { nome: string; valores: number[] };

export type Faixa = {
	inicio: number;
	fim: number;
	centro: number;
	contagens: Record<string, number>;
};

export const CORES_HISTOGRAMA = ["var(--chart-1)", "var(--chart-2)"];

// Chave estável para o dataKey e para a variável de cor: o nome da série pode ter
// espaço e parêntese ("Ceará (geral)"), que não servem em nome de CSS var.
export function chaveSerie(indice: number): string {
	return `serie${indice}`;
}

// Todas as séries dividem as mesmas faixas, para que as barras se sobreponham
// no mesmo lugar do eixo. As bordas caem na centena redonda fora dos dados.
export function histogramaFaixas(
	series: SerieHistograma[],
	quantidade: number,
): { faixas: Faixa[]; dominio: [number, number] } {
	const todos = series.flatMap((serie) => serie.valores);
	if (todos.length === 0) return { faixas: [], dominio: [0, 0] };

	const menor = Math.floor(Math.min(...todos) / 100) * 100;
	const maior = Math.max(Math.ceil(Math.max(...todos) / 100) * 100, menor + 100);
	const largura = (maior - menor) / quantidade;

	const faixas: Faixa[] = Array.from({ length: quantidade }, (_, indice) => {
		const inicio = menor + indice * largura;
		return {
			inicio,
			fim: inicio + largura,
			centro: inicio + largura / 2,
			contagens: Object.fromEntries(series.map((_, indice) => [chaveSerie(indice), 0])),
		};
	});

	for (const [indice, serie] of series.entries()) {
		for (const valor of serie.valores) {
			// O maior valor cai na última faixa em vez de estourar o índice.
			const posicao = Math.min(Math.floor((valor - menor) / largura), quantidade - 1);
			faixas[posicao].contagens[chaveSerie(indice)] += 1;
		}
	}

	return { faixas, dominio: [menor, maior] };
}
