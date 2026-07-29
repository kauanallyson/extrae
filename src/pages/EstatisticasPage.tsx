import { useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
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
	const [searchParams, setSearchParams] = useSearchParams();
	const municipio = (searchParams.get("municipio") ?? "").trim();

	const handleMunicipioChange = useCallback(
		(valor: string) => {
			if (valor === municipio) return;
			setSearchParams(
				(params) => {
					if (valor) params.set("municipio", valor);
					else params.delete("municipio");
					return params;
				},
				{ replace: true },
			);
		},
		[municipio, setSearchParams],
	);

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
					<MunicipioInput inicial={municipio} onChange={handleMunicipioChange} />
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
													{ nome: titulo, stats: data },
													{ nome: "Ceará (geral)", stats: geral },
												]
											: [{ nome: titulo, stats: data }]
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

// O texto digitado fica aqui dentro para que cada tecla não re-renderize os gráficos:
// a página (e a URL) só são avisadas 400 ms depois da última tecla.
function MunicipioInput({
	inicial,
	onChange,
}: {
	inicial: string;
	onChange: (municipio: string) => void;
}) {
	const [texto, setTexto] = useState(inicial);

	useEffect(() => {
		const id = setTimeout(() => onChange(texto.trim()), 400);
		return () => clearTimeout(id);
	}, [texto, onChange]);

	return (
		<Input
			value={texto}
			onChange={(event) => setTexto(event.target.value)}
			aria-label="Filtrar por município"
			placeholder="Todos os municípios"
			className={`${fieldInputClassName} w-56`}
		/>
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
