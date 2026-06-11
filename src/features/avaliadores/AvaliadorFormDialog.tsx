import { Dialog } from "@base-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	type Avaliador,
	type CreateAvaliadorInput,
	createAvaliador,
	updateAvaliador,
} from "@/lib/api";
import { fieldInputClassName } from "@/lib/formStyles";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/utils";
import { type AvaliadorFormValues, avaliadorFormResolver, defaultAvaliadorValues } from "./schema";

export type AvaliadorDialogState = { mode: "create" } | { mode: "edit"; avaliador: Avaliador };

function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export function AvaliadorFormDialog({
	state,
	onClose,
}: {
	state: AvaliadorDialogState | null;
	onClose: () => void;
}) {
	const queryClient = useQueryClient();
	const isEdit = state?.mode === "edit";

	const form = useForm<AvaliadorFormValues>({
		defaultValues: defaultAvaliadorValues,
		resolver: avaliadorFormResolver,
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
			form.reset(defaultAvaliadorValues);
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
			queryClient.invalidateQueries({ queryKey: queryKeys.avaliadores });
			onClose();
		},
	});

	const isPending = mutation.isPending;

	return (
		<Dialog.Root
			open={state !== null}
			onOpenChange={(open) => {
				if (!open) {
					mutation.reset();
					onClose();
				}
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
				<Dialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
					<Dialog.Title className="text-lg font-semibold text-slate-100 mb-4">
						{isEdit ? "Editar avaliador" : "Novo avaliador"}
					</Dialog.Title>

					<form
						onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
						className="space-y-4"
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="avaliador-nome" className="mb-1 block text-sm text-slate-300">
									Nome
								</label>
								<Input
									id="avaliador-nome"
									{...form.register("nome")}
									className={fieldInputClassName}
									placeholder="Nome completo"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.nome?.message} />
							</div>
							<div>
								<label
									htmlFor="avaliador-nomeFantasia"
									className="mb-1 block text-sm text-slate-300"
								>
									Nome fantasia
								</label>
								<Input
									id="avaliador-nomeFantasia"
									{...form.register("nomeFantasia")}
									className={fieldInputClassName}
									placeholder="Nome fantasia"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.nomeFantasia?.message} />
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="avaliador-cpf" className="mb-1 block text-sm text-slate-300">
									CPF
								</label>
								<Input
									id="avaliador-cpf"
									{...form.register("cpf")}
									className={fieldInputClassName}
									placeholder="000.000.000-00"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.cpf?.message} />
							</div>
							<div>
								<label htmlFor="avaliador-cnpj" className="mb-1 block text-sm text-slate-300">
									CNPJ
								</label>
								<Input
									id="avaliador-cnpj"
									{...form.register("cnpj")}
									className={fieldInputClassName}
									placeholder="00.000.000/0000-00"
									disabled={isPending}
								/>
								<FieldError message={form.formState.errors.cnpj?.message} />
							</div>
						</div>

						<div>
							<label htmlFor="avaliador-registroCrea" className="mb-1 block text-sm text-slate-300">
								Registro CREA
							</label>
							<Input
								id="avaliador-registroCrea"
								{...form.register("registroCrea")}
								className={fieldInputClassName}
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
								) : isEdit ? (
									"Salvar"
								) : (
									"Criar"
								)}
							</Button>
						</div>
					</form>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
