import { useQuery } from "@tanstack/react-query";
import {
	DownloadIcon,
	EyeIcon,
	FilterIcon,
	LoaderCircleIcon,
	PencilIcon,
	PlusIcon,
	XIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type Amostra,
	type AmostrasFilters,
	downloadAmostrasPlanilha,
	fetchAmostras,
} from "@/lib/api";
import { triggerDownload } from "@/lib/download";
import { brl, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

const emptyFilters: AmostrasFilters = {};

const numberInputClass =
	"[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function hasFilters(filters: AmostrasFilters): boolean {
	return Object.values(filters).some((v) => v?.trim());
}

export function AmostrasPage() {
	const navigate = useNavigate();

	const [filters, setFilters] = useState<AmostrasFilters>(emptyFilters);
	const [appliedFilters, setAppliedFilters] = useState<AmostrasFilters>(emptyFilters);
	const [exporting, setExporting] = useState(false);

	const {
		data: amostras,
		isLoading,
		isFetching,
		error,
	} = useQuery<Amostra[], Error>({
		queryKey: queryKeys.amostras(appliedFilters),
		queryFn: () => fetchAmostras(appliedFilters),
		keepPreviousData: true,
	});

	useEffect(() => {
		if (error) toast.error(error.message ?? "Erro ao carregar amostras.");
	}, [error]);

	function updateFilter(key: keyof AmostrasFilters, value: string) {
		setFilters((prev) => ({ ...prev, [key]: value }));
	}

	function applyFilters(e: FormEvent) {
		e.preventDefault();
		setAppliedFilters(filters);
	}

	function clearFilters() {
		setFilters(emptyFilters);
		setAppliedFilters(emptyFilters);
	}

	async function handleExport() {
		setExporting(true);
		try {
			triggerDownload(await downloadAmostrasPlanilha(appliedFilters));
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Erro ao exportar planilha.");
		} finally {
			setExporting(false);
		}
	}

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
				<p className="py-8 text-center text-sm text-slate-500">Erro ao carregar amostras.</p>
			</Layout>
		);
	}

	const filtersActive = hasFilters(appliedFilters);

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
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={handleExport}
							disabled={exporting}
						>
							{exporting ? (
								<LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
							) : (
								<DownloadIcon className="h-3.5 w-3.5" />
							)}
							Exportar planilha
						</Button>
						<Link
							to="/nova-amostra"
							className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
						>
							<PlusIcon className="h-3.5 w-3.5" />
							Nova amostra
						</Link>
					</div>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<form onSubmit={applyFilters} className="mb-4">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-from" className="text-xs text-slate-400">
									De
								</Label>
								<Input
									id="filter-from"
									type="date"
									value={filters.from ?? ""}
									onChange={(e) => updateFilter("from", e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-to" className="text-xs text-slate-400">
									Até
								</Label>
								<Input
									id="filter-to"
									type="date"
									value={filters.to ?? ""}
									onChange={(e) => updateFilter("to", e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-municipio" className="text-xs text-slate-400">
									Município
								</Label>
								<Input
									id="filter-municipio"
									placeholder="Ex.: SOBRAL"
									value={filters.municipio ?? ""}
									onChange={(e) => updateFilter("municipio", e.target.value.toUpperCase())}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-uf" className="text-xs text-slate-400">
									UF
								</Label>
								<Input
									id="filter-uf"
									placeholder="Ex.: CE"
									maxLength={2}
									value={filters.uf ?? ""}
									onChange={(e) => updateFilter("uf", e.target.value.toUpperCase())}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-valor-imovel-min" className="text-xs text-slate-400">
									Valor imóvel mín.
								</Label>
								<Input
									id="filter-valor-imovel-min"
									type="number"
									min={0}
									className={numberInputClass}
									placeholder="0"
									value={filters.valorImovelMin ?? ""}
									onChange={(e) => updateFilter("valorImovelMin", e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-valor-imovel-max" className="text-xs text-slate-400">
									Valor imóvel máx.
								</Label>
								<Input
									id="filter-valor-imovel-max"
									type="number"
									min={0}
									className={numberInputClass}
									placeholder="-"
									value={filters.valorImovelMax ?? ""}
									onChange={(e) => updateFilter("valorImovelMax", e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-valor-terreno-min" className="text-xs text-slate-400">
									Valor terreno mín.
								</Label>
								<Input
									id="filter-valor-terreno-min"
									type="number"
									min={0}
									className={numberInputClass}
									placeholder="0"
									value={filters.valorTerrenoMin ?? ""}
									onChange={(e) => updateFilter("valorTerrenoMin", e.target.value)}
								/>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label htmlFor="filter-valor-terreno-max" className="text-xs text-slate-400">
									Valor terreno máx.
								</Label>
								<Input
									id="filter-valor-terreno-max"
									type="number"
									min={0}
									className={numberInputClass}
									placeholder="-"
									value={filters.valorTerrenoMax ?? ""}
									onChange={(e) => updateFilter("valorTerrenoMax", e.target.value)}
								/>
							</div>
						</div>

						<div className="mt-3 flex items-center gap-2">
							<Button
								type="submit"
								variant="default"
								size="sm"
								className="gap-1.5"
								disabled={isFetching}
							>
								{isFetching ? (
									<LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
								) : (
									<FilterIcon className="h-3.5 w-3.5" />
								)}
								Filtrar
							</Button>
							{(filtersActive || hasFilters(filters)) && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="gap-1.5"
									onClick={clearFilters}
								>
									<XIcon className="h-3.5 w-3.5" />
									Limpar
								</Button>
							)}
						</div>
					</form>

					{amostras.length === 0 ? (
						<p className="py-12 text-center text-sm text-slate-500">
							{filtersActive
								? "Nenhuma amostra para os filtros selecionados."
								: "Nenhuma amostra encontrada."}
						</p>
					) : (
						<div className="overflow-x-auto p-2">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-white/10 text-left text-xs text-slate-500">
										<th className="pb-2 pl-3 pr-4 font-medium">Proponente</th>
										<th className="pb-2 pr-4 font-medium">Município/UF</th>
										<th className="pb-2 pr-4 text-right font-medium">Valor Imóvel</th>
										<th className="pb-2 pr-4 text-right font-medium">Valor Terreno</th>
										<th className="pb-2 pr-4 font-medium">Data Referência</th>
										<th className="pb-2 pr-3 font-medium">Ações</th>
									</tr>
								</thead>
								<tbody>
									{amostras.map((amostra) => (
										<tr
											key={amostra.id}
											onClick={() => navigate(`/amostras/${amostra.id}`)}
											className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/5"
										>
											<td className="rounded-l-lg py-3 pl-3 pr-4 font-medium text-slate-100">
												{amostra.proponente || "-"}
											</td>
											<td className="py-3 pr-4 text-slate-300">
												{amostra.municipio
													? `${amostra.municipio}${amostra.uf ? `/${amostra.uf}` : ""}`
													: "-"}
											</td>
											<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
												{amostra.valorImovel != null ? brl.format(amostra.valorImovel) : "-"}
											</td>
											<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
												{amostra.valorTerreno != null ? brl.format(amostra.valorTerreno) : "-"}
											</td>
											<td className="py-3 pr-4 text-slate-300">
												{formatDate(amostra.dataReferencia)}
											</td>
											<td className="rounded-r-lg py-3 pr-3">
												<div className="flex items-center gap-1">
													<Link
														to={`/amostras/${amostra.id}`}
														title="Ver detalhes"
														onClick={(e) => e.stopPropagation()}
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
														onClick={(e) => e.stopPropagation()}
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
