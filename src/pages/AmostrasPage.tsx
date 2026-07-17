import { useInfiniteQuery } from "@tanstack/react-query";
import { DownloadIcon, EyeIcon, LoaderCircleIcon, PencilIcon, PlusIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type AmostrasPage as AmostrasPageResult, downloadAmostrasPlanilha, fetchAmostras } from "@/lib/api";
import { triggerDownload } from "@/lib/download";
import { formatBrlCents, formatDate } from "@/lib/format";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

export function AmostrasPage() {
	const navigate = useNavigate();
	const [exporting, setExporting] = useState(false);
	const loadMoreRef = useRef<HTMLDivElement>(null);

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery<AmostrasPageResult, Error>({
		queryKey: queryKeys.amostras,
		queryFn: ({ pageParam }) => fetchAmostras({ cursor: pageParam as number | undefined }),
		getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
	});

	useEffect(() => {
		if (error) toast.error(error.message ?? "Erro ao carregar amostras.");
	}, [error]);

	useEffect(() => {
		const target = loadMoreRef.current;
		if (!target || !hasNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) fetchNextPage();
			},
			{ rootMargin: "200px" },
		);
		observer.observe(target);
		return () => observer.disconnect();
	}, [hasNextPage, fetchNextPage]);

	async function handleExport() {
		setExporting(true);
		try {
			triggerDownload(await downloadAmostrasPlanilha());
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

	if (error || !data) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<p className="py-8 text-center text-sm text-slate-500">Erro ao carregar amostras.</p>
			</Layout>
		);
	}

	const amostras = data.pages.flatMap((page) => page.data);

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
					{amostras.length === 0 ? (
						<p className="py-12 text-center text-sm text-slate-500">Nenhuma amostra encontrada.</p>
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
												{amostra.valorImovel != null ? formatBrlCents(amostra.valorImovel) : "-"}
											</td>
											<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
												{amostra.valorTerreno != null ? formatBrlCents(amostra.valorTerreno) : "-"}
											</td>
											<td className="py-3 pr-4 text-slate-300">{formatDate(amostra.dataReferencia)}</td>
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

							{hasNextPage && (
								<div ref={loadMoreRef} className="flex justify-center py-4">
									{isFetchingNextPage && (
										<LoaderCircleIcon className="h-4 w-4 animate-spin text-slate-400" />
									)}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
