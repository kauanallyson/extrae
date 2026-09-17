import { useQuery } from "@tanstack/react-query";
import { fetchMunicipios, type Municipio } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useMunicipios() {
	const query = useQuery<Municipio[]>({
		queryKey: queryKeys.municipios,
		queryFn: fetchMunicipios,
	});
	const nomes = query.data?.map((municipio) => municipio.nome) ?? [];
	const totais = new Map(query.data?.map((municipio) => [municipio.nome, municipio.totalAmostras]));
	return { nomes, totais, isLoading: query.isLoading, isError: query.isError };
}
