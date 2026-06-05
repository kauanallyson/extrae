import { AlertDialog, Dialog } from "@base-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	type Avaliador,
	type CreateAvaliadorInput,
	createAvaliador,
	deleteAvaliador,
	fetchAvaliadores,
	updateAvaliador,
} from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const avaliadorSchema = z.object({
	nome: z.string().trim().min(1, "Informe o nome."),
	nomeFantasia: z.string().trim().min(1, "Informe o nome fantasia."),
	cpf: z.string().trim().regex(cpfRegex, "Informe o CPF com máscara: 000.000.000-00."),
	cnpj: z.string().trim().regex(cnpjRegex, "Informe o CNPJ com máscara: 00.000.000/0000-00."),
	registroCrea: z.string().trim().min(1, "Informe o registro CREA.").max(25, "Máximo 25 caracteres."),
});

type AvaliadorFormValues = z.infer<typeof avaliadorSchema>;

const defaultFormValues: AvaliadorFormValues = {
	nome: "",
	nomeFantasia: "",
	cpf: "",
	cnpj: "",
	registroCrea: "",
};

type DialogState = { mode: "create" } | { mode: "edit"; avaliador: Avaliador };

const inputClassName =
	"h-10 rounded-md border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-500 hover:bg-slate-700 focus-visible:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700";

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

function AvaliadorFormDialog({
	state,
	onClose,
}: {
	state: DialogState | null;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const isEdit = state?.mode === "edit";

	const form = useForm<AvaliadorFormValues>({
		defaultValues: defaultFormValues,
	});

	useEffect(() => {
		if (!state) return;
		if (state.mode === "edit") {
			form.reset({
				nome: state.avaliador.nome,
				nomeFantasia: state.avaliador.nomeFantasia,
				cpf: state.avaliador.cpf,
				cnpj: state.avaliador.cnpj,
				registroCrea: state.avaliador.registroCrea,
			});
		} else {
			form.reset(defaultFormValues);
		}
	}, [state, form]);

	const mutation = useMutation<Avaliador, Error, AvaliadorFormValues>({
		mutationFn: async (values) => {
			const input: CreateAvaliadorInput = {
				nome: values.nome.trim(),
				nomeFantasia: values.nomeFantasia.trim(),
				cpf: values.cpf.trim(),
				cnpj: values.cnpj.trim(),
				registroCrea: values.registroCrea.trim(),
			};
			if (isEdit && state.mode === "edit") {
				return updateAvaliador(state.avaliador.id, input);
			}
			return createAvaliador(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["avaliadores"] });
			onClose();
		},
	});

	function validate(values: AvaliadorFormValues) {
		const result = avaliadorSchema.safeParse(values);
		if (result.success) return true;
		for (const issue of result.error.issues) {
			form.setError(issue.path[0] as keyof AvaliadorFormValues, { message: issue.message });
		}
		return false;
	}

	function onSubmit(values: AvaliadorFormValues) {
		if (!validate(values)) return;
		mutation.mutate(values);
	}

	const isPending = mutation.isPending;

	return (
		<Dialog.Root open={state !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
				<Dialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
					<Dialog.Title className="text-lg font-semibold text-slate-100 mb-4">
						{isEdit ? "Editar avaliador" : "Novo avaliador"}
					</Dialog.Title>

					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm text-slate-300">Nome</label>
								<Input
									{...form.register("nome")}
									className={inputClassName}
									placeholder="Nome completo"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.nome?.message} />
							</div>
							<div>
								<label className="mb-1 block text-sm text-slate-300">Nome fantasia</label>
								<Input
									{...form.register("nomeFantasia")}
									className={inputClassName}
									placeholder="Nome fantasia"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.nomeFantasia?.message} />
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label className="mb-1 block text-sm text-slate-300">CPF</label>
								<Input
									{...form.register("cpf")}
									className={inputClassName}
									placeholder="000.000.000-00"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.cpf?.message} />
							</div>
							<div>
								<label className="mb-1 block text-sm text-slate-300">CNPJ</label>
								<Input
									{...form.register("cnpj")}
									className={inputClassName}
									placeholder="00.000.000/0000-00"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.cnpj?.message} />
							</div>
						</div>

						<div>
							<label className="mb-1 block text-sm text-slate-300">Registro CREA</label>
							<Input
								{...form.register("registroCrea")}
								className={inputClassName}
								placeholder="Ex: 123456-D/CE"
								maxLength={25}
								disabled={isPending}
							/>
							<FieldError message={form.formState.errors.registroCrea?.message} />
						</div>

						{mutation.error && (
							<p className="text-sm text-red-400">{getErrorMessage(mutation.error)}</p>
						)}

						<div className="flex justify-end gap-3 pt-2">
							<Dialog.Close
								render={
									<button
										type="button"
										className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
										disabled={isPending}
									>
										Cancelar
									</button>
								}
							/>
							<Button
								type="submit"
								disabled={isPending}
								className="h-9 bg-slate-100 text-slate-900 hover:bg-slate-200"
							>
								{isPending ? (
									<>
										<LoaderCircleIcon className="animate-spin h-4 w-4" />
										Salvando...
									</>
								) : (
									isEdit ? "Salvar" : "Criar"
								)}
							</Button>
						</div>
					</form>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

function DeleteAvaliadorDialog({
	avaliador,
	onClose,
}: {
	avaliador: Avaliador | null;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: () => deleteAvaliador(avaliador!.id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["avaliadores"] });
			onClose();
		},
	});

	return (
		<AlertDialog.Root open={avaliador !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
				<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
					<AlertDialog.Title className="text-base font-semibold text-slate-100">
						Deletar avaliador?
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-2 text-sm text-slate-400">
						{avaliador && (
							<>
								<span className="font-medium text-slate-300">{avaliador.nome}</span> será permanentemente removido. Essa ação não pode ser desfeita.
							</>
						)}
					</AlertDialog.Description>
					{deleteMutation.error instanceof Error && (
						<p className="mt-3 text-sm text-red-400">{getErrorMessage(deleteMutation.error)}</p>
					)}
					<div className="mt-5 flex justify-end gap-3">
						<AlertDialog.Close
							render={
								<button
									type="button"
									className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
									disabled={deleteMutation.isPending}
								>
									Cancelar
								</button>
							}
						/>
						<AlertDialog.Close
							render={
								<button
									type="button"
									className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
									disabled={deleteMutation.isPending}
									onClick={() => deleteMutation.mutate()}
								>
									{deleteMutation.isPending ? "Deletando..." : "Deletar"}
								</button>
							}
						/>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}

export function AvaliadorPage() {
	const [dialogState, setDialogState] = useState<DialogState | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Avaliador | null>(null);

	const { data: avaliadores, isLoading, error } = useQuery<Avaliador[], Error>({
		queryKey: ["avaliadores"],
		queryFn: fetchAvaliadores,
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
									{[...avaliadores].sort((a, b) => a.id - b.id).map((avaliador) => (
										<tr
											key={avaliador.id}
											className="border-b border-white/5 last:border-0"
										>
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

			<AvaliadorFormDialog
				state={dialogState}
				onClose={() => setDialogState(null)}
			/>
			<DeleteAvaliadorDialog
				avaliador={deleteTarget}
				onClose={() => setDeleteTarget(null)}
			/>
		</Layout>
	);
}
