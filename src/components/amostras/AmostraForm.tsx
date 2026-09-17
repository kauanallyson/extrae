import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { type KeyboardEvent, useId, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { AvaliadorSelectField } from "@/components/avaliadores/AvaliadorSelectField";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
	type AmostraFormValues,
	fieldGroups,
	fieldSpecs,
	identificationGroupTitle,
} from "@/features/amostras/fields";
import type { SaveAmostra } from "@/features/amostras/useSaveAmostra";
import { fieldInputClassName, secondaryButtonClassName } from "@/lib/formStyles";
import { cn } from "@/lib/utils";
import { maskTelefone } from "@/lib/validators";
import { AmostraField } from "./AmostraField";
import { DecimalArrayField } from "./DecimalArrayField";
import { FormSection } from "./FormSection";
import { IncidenciaServicosField } from "./IncidenciaServicosField";

type AmostraFormProps = {
	form: UseFormReturn<AmostraFormValues>;
	save: SaveAmostra;
	resetLabel: string;
	onReset: () => void;
	camposNaoEncontrados?: Set<string>;
};

export function AmostraForm({
	form,
	save,
	resetLabel,
	onReset,
	camposNaoEncontrados = new Set(),
}: AmostraFormProps) {
	const isSubmitting = save.isPending;
	const gerarRaeId = useId();
	const acumuladoProposto = useFieldArray({ control: form.control, name: "acumuladoProposto" });
	const formRef = useRef<HTMLFormElement>(null);

	// Enter inside a text input must not submit the whole form; only the
	// Salvar button should trigger submission. Textareas keep newline behavior.
	const preventEnterSubmit = (event: KeyboardEvent<HTMLFormElement>) => {
		const target = event.target as HTMLElement;
		if (event.key === "Enter" && target.tagName === "INPUT") {
			event.preventDefault();
		}
	};

	const scrollToFirstError = () => {
		requestAnimationFrame(() => {
			const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
			if (!target) return;
			target.scrollIntoView({ behavior: "smooth", block: "center" });
			target.focus({ preventScroll: true });
		});
	};

	return (
		<Form {...form}>
			<form
				ref={formRef}
				onSubmit={form.handleSubmit(save.submit, scrollToFirstError)}
				onKeyDown={preventEnterSubmit}
				className="space-y-8"
			>
				<FormSection title="Avaliador" description="Profissional responsável pela avaliação.">
					<AvaliadorSelectField control={form.control} disabled={isSubmitting} />
				</FormSection>

				<FormSection title="Identificação" description="Dados do proponente e contato.">
					<AmostraField
						control={form.control}
						name="proponente"
						disabled={isSubmitting}
						missing={camposNaoEncontrados.has("proponente")}
					/>
					<div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem_minmax(0,1fr)]">
						{(["cpf", "cnpj"] as const).map((fieldName) => (
							<AmostraField
								key={fieldName}
								control={form.control}
								name={fieldName}
								disabled={isSubmitting}
								missing={camposNaoEncontrados.has(fieldName)}
							/>
						))}
						<FormField
							control={form.control}
							name="ddd"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="text-slate-200">
										DDD
										{camposNaoEncontrados.has("ddd") && (
											<span className="ml-2 text-xs font-normal text-amber-400">
												Não identificado
											</span>
										)}
									</FormLabel>
									<Input
										{...field}
										type="text"
										inputMode="numeric"
										maxLength={2}
										placeholder="00"
										aria-invalid={fieldState.invalid}
										disabled={isSubmitting}
										className={cn(
											fieldInputClassName,
											"text-center",
											camposNaoEncontrados.has("ddd") &&
												"border-amber-500/70 focus-visible:border-amber-400",
										)}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="telefone"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="text-slate-200">
										Telefone
										{camposNaoEncontrados.has("telefone") && (
											<span className="ml-2 text-xs font-normal text-amber-400">
												Não identificado
											</span>
										)}
									</FormLabel>
									<Input
										{...field}
										type="text"
										inputMode="tel"
										placeholder="00000-000"
										maxLength={10}
										aria-invalid={fieldState.invalid}
										disabled={isSubmitting}
										onChange={(event) => field.onChange(maskTelefone(event.target.value))}
										className={cn(
											fieldInputClassName,
											camposNaoEncontrados.has("telefone") &&
												"border-amber-500/70 focus-visible:border-amber-400",
										)}
									/>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</FormSection>

				{fieldGroups
					.filter((g) => g.title !== identificationGroupTitle)
					.map((group) => (
						<FormSection key={group.title} title={group.title} description={group.description}>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{group.fields.map((fieldName) => (
									<div
										key={fieldName}
										className={
											fieldSpecs[fieldName].kind === "textarea"
												? "sm:col-span-2 lg:col-span-3"
												: undefined
										}
									>
										<AmostraField
											control={form.control}
											name={fieldName}
											disabled={isSubmitting}
											missing={camposNaoEncontrados.has(fieldName)}
										/>
									</div>
								))}
							</div>
						</FormSection>
					))}

				<FormSection
					title="Incidências"
					description="Informe o peso (%) de cada serviço. O total deve somar 100%."
				>
					<IncidenciaServicosField control={form.control} disabled={isSubmitting} />
				</FormSection>

				<FormSection
					title="Acumulado proposto"
					description="Adicione os valores de acumulado proposto da avaliação."
				>
					<div className="grid gap-6 lg:grid-cols-2">
						<DecimalArrayField
							control={form.control}
							name="acumuladoProposto"
							disabled={isSubmitting}
							fieldArray={acumuladoProposto}
						/>
					</div>
				</FormSection>

				<div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
					<label
						htmlFor={gerarRaeId}
						className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-600 bg-slate-800 px-3 py-3 text-sm text-slate-100"
					>
						<Switch
							id={gerarRaeId}
							checked={save.gerarRae}
							disabled={isSubmitting}
							onCheckedChange={(checked) => save.setGerarRae(checked)}
							className="data-checked:bg-emerald-500 data-unchecked:bg-slate-600 focus-visible:ring-slate-400/40"
						/>
						Gerar planilha RAE após salvar
					</label>

					<div className="flex gap-3 sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onReset();
								save.reset();
							}}
							disabled={isSubmitting}
							className={cn("h-10", secondaryButtonClassName)}
						>
							{resetLabel}
						</Button>
						<Button
							type="submit"
							disabled={isSubmitting}
							className="h-10 bg-slate-100 text-slate-900 hover:bg-slate-200"
						>
							{isSubmitting ? (
								<>
									<LoaderCircleIcon className="animate-spin" />
									Salvando...
								</>
							) : (
								<>
									<CheckCircle2Icon />
									Salvar dados
								</>
							)}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}
