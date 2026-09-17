import { useQueries } from "@tanstack/react-query";
import { fetchAmostra } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

// A rota de estatísticas devolve só os ids fora dos limites; o valor de cada um
// vem da própria amostra.
export function useOutliers(ids: number[]) {
	const queries = useQueries({
		queries: ids.map((id) => ({
			queryKey: queryKeys.amostra(id),
			queryFn: () => fetchAmostra(id),
			staleTime: 5 * 60 * 1000,
		})),
	});
	return queries.flatMap((query) =>
		query.data?.valorUnitario != null
			? [{ id: query.data.id, valor: query.data.valorUnitario }]
			: [],
	);
}
