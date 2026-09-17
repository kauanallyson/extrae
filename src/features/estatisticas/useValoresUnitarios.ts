import { useQuery } from "@tanstack/react-query";
import { type AmostrasFilters, fetchAmostras } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const LIMITE_PAGINA = 200;

// O histograma precisa de cada valor, não só do resumo; a listagem é paginada
// por cursor, então percorre todas as páginas e guarda só o valor unitário.
export function useValoresUnitarios(filters: AmostrasFilters, enabled = true) {
	return useQuery<number[], Error>({
		queryKey: [...queryKeys.amostras(filters), "valores-unitarios"],
		queryFn: async () => {
			const valores: number[] = [];
			let cursor: number | undefined;
			do {
				const page = await fetchAmostras(filters, { cursor, limit: LIMITE_PAGINA });
				for (const amostra of page.data) {
					if (amostra.valorUnitario != null) valores.push(amostra.valorUnitario);
				}
				cursor = page.nextCursor ?? undefined;
			} while (cursor != null);
			return valores;
		},
		staleTime: 5 * 60 * 1000,
		enabled,
	});
}
