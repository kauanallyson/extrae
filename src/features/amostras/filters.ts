import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { AmostrasFilters, AmostraTipo } from "@/lib/api";

const tipos: AmostraTipo[] = ["imovel", "terreno"];

// Os filtros vivem na URL: sobrevivem ao refresh e são compartilháveis.
// Lista, exportação e estatísticas leem o mesmo valor.
export function useAmostrasFilters(defaults: AmostrasFilters = {}) {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters = useMemo<AmostrasFilters>(() => {
		const tipoParam = searchParams.get("tipo");
		const municipio = (searchParams.get("municipio") ?? "").trim();
		return {
			...defaults,
			...(tipos.includes(tipoParam as AmostraTipo) && { tipo: tipoParam as AmostraTipo }),
			...(municipio && { municipio }),
		};
	}, [searchParams, defaults]);

	const setFilter = useCallback(
		(key: keyof AmostrasFilters, value: string | undefined) => {
			setSearchParams(
				(params) => {
					if (value) params.set(key, value);
					else params.delete(key);
					return params;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	return { filters, setFilter };
}
