import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	type AvaliadorDialogState,
	AvaliadorFormDialog,
} from "@/features/avaliadores/AvaliadorFormDialog";
import { type Avaliador, deleteAvaliador, fetchAvaliadores } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { cn, getErrorMessage } from "@/lib/utils";

export function AvaliadorPage() {
	const [dialogState, setDialogState] = useState<AvaliadorDialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Avaliador | null>(null);
	const queryClient = useQueryClient();

	const {
		data: avaliadores,
		isLoading,
		error,
	} = useQuery<Avaliador[], Error>({
		queryKey: queryKeys.avaliadores,
		queryFn: fetchAvaliadores,
	});

	const deleteMutation = useMutation({
		mutationFn: () => {
			if (!deleteTarget?.id) throw new Error("Avaliador inválido.");
			return deleteAvaliador(deleteTarget.id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.avaliadores });
			setDeleteTarget(null);
		},
	});

	if (isLoading) {
		return (
			<Layout contentClassName="block max-w-4xl py-8 sm:py-10">
				<div className="flex justify-center py-20">
					<LoaderCircleIcon className="h-6 w-6 animate-spin text-slate-400" />
				</div>
			</Layout>
		);
	}

	if (error || !avaliadores) {
		return (
			<Layout contentClassName="block max-w-4xl py-8 sm:py-10">
				<Alert variant="destructive">
					<AlertDescription>{error?.message ?? "Erro ao carregar avaliadores."}</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	return (
		<Layout contentClassName="block max-w-4xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="flex flex-row items-center justify-between px-6 pt-6">
					<div className="flex items-center gap-3">
						<CardTitle className="text-xl">Avaliadores</CardTitle>
						<span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
							{avaliadores.length}
						</span>
					</div>
					<button
						type="button"
						onClick={() => setDialogState({ mode: "create" })}
						className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
					>
						<PlusIcon className="h-3.5 w-3.5" />
						Novo avaliador
					</button>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					{avaliadores.length === 0 ? (
						<p className="py-12 text-center text-sm text-slate-500">Nenhum avaliador cadastrado.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-white/10 text-left text-xs text-slate-500">
										<th className="pb-2 pr-4 font-medium">#</th>
										<th className="pb-2 pr-4 font-medium">Nome</th>
										<th className="pb-2 pr-4 font-medium">Nome fantasia</th>
										<th className="pb-2 pr-4 font-medium">CPF</th>
										<th className="pb-2 pr-4 font-medium">CNPJ</th>
										<th className="pb-2 pr-4 font-medium">CREA</th>
										<th className="pb-2 font-medium">Ações</th>
									</tr>
								</thead>
								<tbody>
									{[...avaliadores]
										.sort((a, b) => a.id - b.id)
										.map((avaliador) => (
											<tr key={avaliador.id} className="border-b border-white/5 last:border-0">
												<td className="py-3 pr-4 text-slate-500">{avaliador.id}</td>
												<td className="py-3 pr-4 font-medium text-slate-100">{avaliador.nome}</td>
												<td className="py-3 pr-4 text-slate-300">{avaliador.nomeFantasia}</td>
												<td className="py-3 pr-4 text-slate-300 tabular-nums">{avaliador.cpf}</td>
												<td className="py-3 pr-4 text-slate-300 tabular-nums">{avaliador.cnpj}</td>
												<td className="py-3 pr-4 text-slate-300">{avaliador.registroCrea}</td>
												<td className="py-3">
													<div className="flex items-center gap-1">
														<button
															type="button"
															title="Editar"
															onClick={() => setDialogState({ mode: "edit", avaliador })}
															className={cn(
																buttonVariants({ variant: "ghost", size: "icon" }),
																"h-7 w-7 hover:bg-white/10",
															)}
														>
															<PencilIcon className="h-3.5 w-3.5" />
														</button>
														<button
															type="button"
															title="Deletar"
															onClick={() => setDeleteTarget(avaliador)}
															className={cn(
																buttonVariants({ variant: "ghost", size: "icon" }),
																"h-7 w-7 text-red-400 hover:bg-red-950/60 hover:text-red-300",
															)}
														>
															<Trash2Icon className="h-3.5 w-3.5" />
														</button>
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

			<AvaliadorFormDialog state={dialogState} onClose={() => setDialogState(null)} />
			<ConfirmDeleteDialog
				open={deleteTarget !== null}
				onOpenChange={(open) => {
					if (!open) setDeleteTarget(null);
				}}
				title="Deletar avaliador?"
				description={
					deleteTarget && (
						<>
							<span className="font-medium text-slate-300">{deleteTarget.nome}</span> será
							permanentemente removido. Essa ação não pode ser desfeita.
						</>
					)
				}
				pending={deleteMutation.isPending}
				onConfirm={() => deleteMutation.mutate()}
				closeOnConfirm={false}
				error={
					deleteMutation.error instanceof Error ? (
						<p className="mt-3 text-sm text-red-400">{getErrorMessage(deleteMutation.error)}</p>
					) : undefined
				}
			/>
		</Layout>
	);
}
