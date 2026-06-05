import { type ReactNode, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { AvaliadorSelectField } from "@/components/AvaliadorSelectField";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AmostraTextField } from "./AmostraTextField";
import {
	type AmostraFormValues,
	fieldGroups,
	fieldInputClassName,
	identificationGroupTitle,
} from "./amostraFormSchema";
import { DecimalArrayField } from "./DecimalArrayField";
import { FormSection } from "./FormSection";
import { IncidenciaServicosField } from "./IncidenciaServicosField";

type AmostraFormProps = {
	form: UseFormReturn<AmostraFormValues>;
	isSubmitting: boolean;
	onSubmit: (values: AmostraFormValues) => void;
	footer: ReactNode;
};

export function AmostraForm({ form, isSubmitting, onSubmit, footer }: AmostraFormProps) {
	const acumuladoProposto = useFieldArray({ control: form.control, name: "acumuladoProposto" });
	const formRef = useRef<HTMLFormElement>(null);

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
				onSubmit={form.handleSubmit(onSubmit, scrollToFirstError)}
				className="space-y-8"
			>
				<FormSection title="Avaliador" description="Profissional responsável pela avaliação.">
					<AvaliadorSelectField control={form.control} name="avaliadorId" disabled={isSubmitting} />
				</FormSection>

				<FormSection title="Identificação" description="Dados do proponente e contato.">
					<AmostraTextField control={form.control} name="proponente" disabled={isSubmitting} />
					<div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_5rem_minmax(0,1fr)]">
						{(["cpf", "cnpj"] as const).map((fieldName) => (
							<AmostraTextField
								key={fieldName}
								control={form.control}
								name={fieldName}
								disabled={isSubmitting}
							/>
						))}
						<FormField
							control={form.control}
							name="ddd"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="text-slate-200">DDD</FormLabel>
									<Input
										{...field}
										type="text"
										inputMode="numeric"
										maxLength={2}
										placeholder="00"
										aria-invalid={fieldState.invalid}
										disabled={isSubmitting}
										className={cn(fieldInputClassName, "text-center")}
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
									<FormLabel className="text-slate-200">Telefone</FormLabel>
									<Input
										{...field}
										type="text"
										inputMode="tel"
										placeholder="00000-0000"
										aria-invalid={fieldState.invalid}
										disabled={isSubmitting}
										className={fieldInputClassName}
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
									<AmostraTextField
										key={fieldName}
										control={form.control}
										name={fieldName}
										disabled={isSubmitting}
									/>
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

				{footer}
			</form>
		</Form>
	);
}
