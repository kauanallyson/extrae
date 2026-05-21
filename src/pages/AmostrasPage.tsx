import { useQuery } from "@tanstack/react-query";
import { EyeIcon, LoaderCircleIcon, PencilIcon, PlusIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Amostra, fetchAmostras } from "@/lib/api";
import { cn } from "@/lib/utils";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormat = new Intl.DateTimeFormat("pt-BR");

function formatDate(value: string): string {
	if (!value) return "—";
	const d = new Date(value);
	return isNaN(d.getTime()) ? value : dateFormat.format(d);
}

export function AmostrasPage() {
	const navigate = useNavigate();
	const { data: amostras, isLoading, error } = useQuery<Amostra[], Error>({ queryKey: ["amostras"], queryFn: fetchAmostras });

	if (isLoading) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<div className="flex justify-center py-20">
					<LoaderCircleIcon className="h-6 w-6 animate-spin text-slate-400" />
				</div>
			</Layout>
		);
	}

	if (error || !amostras) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<Alert variant="destructive">
					<AlertDescription>{error?.message ?? "Erro ao carregar amostras."}</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="flex flex-row items-center justify-between px-6 pt-6">
					<div className="flex items-center gap-3">
						<CardTitle className="text-xl">Amostras</CardTitle>
						<span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
							{amostras.length}
						</span>
					</div>
					<Link
						to="/nova-amostra"
						className={cn(
							buttonVariants({ variant: "default", size: "sm" }),
							"gap-1.5",
						)}
					>
						<PlusIcon className="h-3.5 w-3.5" />
						Nova amostra
					</Link>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					{amostras.length === 0 ? (
						<p className="py-12 text-center text-sm text-slate-500">Nenhuma amostra encontrada.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-white/10 text-left text-xs text-slate-500">
										<th className="pb-2 pr-4 font-medium">#</th>
										<th className="pb-2 pr-4 font-medium">Proponente</th>
										<th className="pb-2 pr-4 font-medium">Município/UF</th>
										<th className="pb-2 pr-4 text-right font-medium">Valor Imóvel</th>
										<th className="pb-2 pr-4 font-medium">Data Referência</th>
										<th className="pb-2 font-medium">Ações</th>
									</tr>
								</thead>
								<tbody>
									{amostras.map((amostra) => (
										<tr
											key={amostra.id}
											onClick={() => navigate(`/amostras/${amostra.id}`)}
											className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/5"
										>
											<td className="py-3 pr-4 text-slate-500">{amostra.id}</td>
											<td className="py-3 pr-4 font-medium text-slate-100">
												{amostra.proponente || "—"}
											</td>
											<td className="py-3 pr-4 text-slate-300">
												{amostra.municipio
													? `${amostra.municipio}${amostra.uf ? `/${amostra.uf}` : ""}`
													: "—"}
											</td>
											<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
												{amostra.valorImovel ? brl.format(amostra.valorImovel) : "—"}
											</td>
											<td className="py-3 pr-4 text-slate-300">
												{formatDate(amostra.dataReferencia)}
											</td>
											<td className="py-3">
												<div
													className="flex items-center gap-1"
													onClick={(e) => e.stopPropagation()}
												>
													<Link
														to={`/amostras/${amostra.id}`}
														title="Ver detalhes"
														className={cn(
															buttonVariants({ variant: "ghost", size: "icon" }),
															"h-7 w-7 hover:bg-white/10",
														)}
													>
														<EyeIcon className="h-3.5 w-3.5" />
													</Link>
													<Link
														to={`/amostras/${amostra.id}/editar`}
														title="Editar"
														className={cn(
															buttonVariants({ variant: "ghost", size: "icon" }),
															"h-7 w-7 hover:bg-white/10",
														)}
													>
														<PencilIcon className="h-3.5 w-3.5" />
													</Link>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
