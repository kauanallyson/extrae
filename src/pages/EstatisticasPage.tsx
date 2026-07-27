import { useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ComparativoChart } from "@/components/estatisticas/ComparativoChart";
import { DistribuicaoChart } from "@/components/estatisticas/DistribuicaoChart";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AmostrasStats, fetchAmostrasStats } from "@/lib/api";
import { formatBrl } from "@/lib/format";
import { fieldInputClassName } from "@/lib/formStyles";
import { queryKeys } from "@/lib/queryKeys";

export function EstatisticasPage() {
	const [texto, setTexto] = useState("");
	const [municipio, setMunicipio] = useState("");

	// Espera o usuário parar de digitar antes de consultar a rota.
	useEffect(() => {
		const id = setTimeout(() => setMunicipio(texto.trim()), 400);
		return () => clearTimeout(id);
	}, [texto]);

	const { data, isLoading, error } = useQuery<AmostrasStats, Error>({
		queryKey: queryKeys.stats(municipio || undefined),
		queryFn: () => fetchAmostrasStats(municipio),
	});

	const { data: geral } = useQuery<AmostrasStats, Error>({
		queryKey: queryKeys.stats(),
		queryFn: () => fetchAmostrasStats(),
		enabled: Boolean(municipio),
	});

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
					<Input
						value={texto}
						onChange={(event) => setTexto(event.target.value)}
						aria-label="Filtrar por município"
						placeholder="Todos os municípios"
						className={`${fieldInputClassName} w-56`}
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
							<div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
								<Indicador label="Amostras" valor={String(data.total)} />
								<Indicador label="Média" valor={data.mean != null ? formatBrl(data.mean) : "-"} />
								<Indicador
									label="Mediana"
									valor={data.median != null ? formatBrl(data.median) : "-"}
								/>
								<Indicador
									label="Desvio padrão"
									valor={data.stdDev != null ? formatBrl(data.stdDev) : "-"}
								/>
								<Indicador label="Outliers" valor={String(data.outlierIds.length)} />
							</div>

							<section className="flex flex-col gap-2">
								<h2 className="text-sm font-medium text-slate-300">Distribuição — {titulo}</h2>
								<p className="text-xs text-slate-500">
									A caixa vai de Q1 a Q3, dividida na mediana. Os bigodes marcam os limites de Tukey
									(Q1 − 1,5·IQR e Q3 + 1,5·IQR); as linhas tracejadas, o mínimo e o máximo.
								</p>
								<DistribuicaoChart stats={data} titulo={titulo} />
							</section>

							{municipio && geral && (
								<section className="flex flex-col gap-2">
									<h2 className="text-sm font-medium text-slate-300">
										{municipio} comparado ao Ceará
									</h2>
									<ComparativoChart municipio={municipio} stats={data} geral={geral} />
								</section>
							)}

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

function Indicador({ label, valor }: { label: string; valor: string }) {
	return (
		<div className="rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3">
			<p className="text-xs text-slate-400">{label}</p>
			<p className="mt-1 text-lg font-semibold tabular-nums text-slate-100">{valor}</p>
		</div>
	);
}
