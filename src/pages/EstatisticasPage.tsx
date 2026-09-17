import { useQueries, useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { DistribuicaoChart } from "@/components/estatisticas/DistribuicaoChart";
import { Layout } from "@/components/Layout";
import { MunicipioFilterCombobox } from "@/components/municipios/MunicipioFilterCombobox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAmostrasFilters } from "@/features/amostras/filters";
import { type AmostrasStats, fetchAmostra, fetchAmostrasStats } from "@/lib/api";
import { formatBrl } from "@/lib/format";
import { queryKeys } from "@/lib/queryKeys";

export function EstatisticasPage() {
	const { filters, setFilter } = useAmostrasFilters();
	const municipio = filters.municipio ?? "";

	const { data, isLoading, error } = useQuery<AmostrasStats, Error>({
		queryKey: queryKeys.stats(filters),
		queryFn: () => fetchAmostrasStats(filters),
	});

	// Sem município a consulta principal já é o geral; a comparação só faz sentido com filtro.
	const geralQuery = useQuery<AmostrasStats, Error>({
		queryKey: queryKeys.stats({}),
		queryFn: () => fetchAmostrasStats(),
		enabled: Boolean(municipio),
	});
	const geral = municipio ? geralQuery.data : undefined;

	const outliers = useOutliers(data?.outlierIds ?? []);
	const outliersGeral = useOutliers(geral?.outlierIds ?? []);

	useEffect(() => {
		if (error) toast.error(error.message ?? "Erro ao carregar estatísticas.");
	}, [error]);

	const titulo = municipio || "Ceará (geral)";

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="flex flex-row items-center justify-between px-6 pt-6">
					<div>
						<CardTitle className="text-xl">Estatísticas</CardTitle>
						<p className="text-sm text-slate-400">Distribuição do valor unitário (R$/m²)</p>
					</div>
					<MunicipioFilterCombobox
						value={municipio}
						onValueChange={(valor) => setFilter("municipio", valor)}
					/>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					{isLoading ? (
						<div className="flex justify-center py-20">
							<LoaderCircleIcon className="h-6 w-6 animate-spin text-slate-400" />
						</div>
					) : error || !data ? (
						<p className="py-12 text-center text-sm text-slate-500">
							Erro ao carregar estatísticas.
						</p>
					) : data.total === 0 ? (
						<p className="py-12 text-center text-sm text-slate-500">
							Nenhuma amostra encontrada para {titulo}.
						</p>
					) : (
						<div className="flex flex-col gap-8">
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
								<Indicador
									label="Amostras"
									valor={String(data.total)}
									geral={geral && String(geral.total)}
								/>
								<Indicador
									label="Média"
									valor={data.mean != null ? formatBrl(data.mean) : "-"}
									geral={geral?.mean != null ? formatBrl(geral.mean) : undefined}
								/>
								<Indicador
									label="Mediana"
									valor={data.median != null ? formatBrl(data.median) : "-"}
									geral={geral?.median != null ? formatBrl(geral.median) : undefined}
								/>
								<Indicador
									label="Desvio padrão"
									valor={data.stdDev != null ? formatBrl(data.stdDev) : "-"}
									geral={geral?.stdDev != null ? formatBrl(geral.stdDev) : undefined}
								/>
								<Indicador
									label="Outliers"
									valor={String(data.outlierIds.length)}
									geral={geral && String(geral.outlierIds.length)}
								/>
								<Indicador
									label="IQR"
									valor={data.iqr != null ? formatBrl(data.iqr) : "-"}
									geral={geral?.iqr != null ? formatBrl(geral.iqr) : undefined}
								/>
								<Indicador
									label="Mínimo"
									valor={data.min != null ? formatBrl(data.min) : "-"}
									geral={geral?.min != null ? formatBrl(geral.min) : undefined}
								/>
								<Indicador
									label="Limite inferior"
									valor={data.lowerFence != null ? formatBrl(data.lowerFence) : "-"}
									geral={geral?.lowerFence != null ? formatBrl(geral.lowerFence) : undefined}
								/>
								<Indicador
									label="Q1"
									valor={data.q1 != null ? formatBrl(data.q1) : "-"}
									geral={geral?.q1 != null ? formatBrl(geral.q1) : undefined}
								/>
								<Indicador
									label="Q3"
									valor={data.q3 != null ? formatBrl(data.q3) : "-"}
									geral={geral?.q3 != null ? formatBrl(geral.q3) : undefined}
								/>
								<Indicador
									label="Limite superior"
									valor={data.upperFence != null ? formatBrl(data.upperFence) : "-"}
									geral={geral?.upperFence != null ? formatBrl(geral.upperFence) : undefined}
								/>
								<Indicador
									label="Máximo"
									valor={data.max != null ? formatBrl(data.max) : "-"}
									geral={geral?.max != null ? formatBrl(geral.max) : undefined}
								/>
							</div>

							<section className="flex flex-col gap-2">
								<h2 className="text-sm font-medium text-slate-300">
									Distribuição do valor unitário
								</h2>
								<p className="text-xs text-slate-500">
									A caixa vai de Q1 a Q3, com a mediana marcada dentro dela; os bigodes vão do menor
									ao maior valor observado.
								</p>
								<DistribuicaoChart
									series={
										geral
											? [
													{ nome: titulo, stats: data, outliers },
													{ nome: "Ceará (geral)", stats: geral, outliers: outliersGeral },
												]
											: [{ nome: titulo, stats: data, outliers }]
									}
								/>
							</section>

							{data.outlierIds.length > 0 && (
								<section className="flex flex-col gap-2">
									<h2 className="text-sm font-medium text-slate-300">
										Amostras fora dos limites de Tukey
									</h2>
									<div className="flex flex-wrap gap-1.5">
										{data.outlierIds.map((id) => (
											<Link key={id} to={`/amostras/${id}`}>
												<Badge
													variant="outline"
													className="border-slate-600 text-slate-300 hover:bg-white/5"
												>
													#{id}
												</Badge>
											</Link>
										))}
									</div>
								</section>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}

// A rota de estatísticas devolve só os ids fora dos limites; o valor de cada um
// vem da própria amostra.
function useOutliers(ids: number[]) {
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

function Indicador({ label, valor, geral }: { label: string; valor: string; geral?: string }) {
	return (
		<div className="rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3">
			<p className="text-xs text-slate-400">{label}</p>
			<p className="mt-1 text-lg font-semibold text-slate-100">{valor}</p>
			{geral && <p className="mt-0.5 text-xs text-slate-500">Ceará: {geral}</p>}
		</div>
	);
}
