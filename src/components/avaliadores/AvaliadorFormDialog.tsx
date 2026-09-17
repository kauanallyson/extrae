import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FieldError } from "@/components/shared/FieldError";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	type AvaliadorFormValues,
	avaliadorFormResolver,
	defaultAvaliadorValues,
} from "@/features/avaliadores/schema";
import { avaliadorToFormValues, parseAvaliadorFormValues } from "@/features/avaliadores/transforms";
import { type Avaliador, createAvaliador, updateAvaliador } from "@/lib/api";
import { fieldInputClassName, secondaryButtonClassName } from "@/lib/formStyles";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/utils";

export type AvaliadorDialogState = { mode: "create" } | { mode: "edit"; avaliador: Avaliador };

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
		form.reset(
			state.mode === "edit" ? avaliadorToFormValues(state.avaliador) : defaultAvaliadorValues,
		);
	}, [state, form]);

	const mutation = useMutation<Avaliador, Error, AvaliadorFormValues>({
		mutationFn: async (values) => {
			const input = parseAvaliadorFormValues(values);
			if (state?.mode === "edit") return updateAvaliador(state.avaliador.id, input);
			return createAvaliador(input);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.avaliadores });
			onClose();
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});

	const isPending = mutation.isPending;

	return (
		<Dialog
			open={state !== null}
			onOpenChange={(open) => {
				if (!open) {
					mutation.reset();
					onClose();
				}
			}}
		>
			<DialogContent className="dark border-white/10 bg-slate-900 p-6 text-slate-100">
				<DialogHeader>
					<DialogTitle className="text-lg font-semibold text-slate-100">
						{isEdit ? "Editar avaliador" : "Novo avaliador"}
					</DialogTitle>
				</DialogHeader>

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
							<label htmlFor="avaliador-nomeFantasia" className="mb-1 block text-sm text-slate-300">
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

					<DialogFooter className="pt-2">
						<DialogClose
							disabled={isPending}
							render={
								<Button type="button" variant="outline" className={secondaryButtonClassName} />
							}
						>
							Cancelar
						</DialogClose>
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
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
