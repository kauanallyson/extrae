import type { Control, FieldPath } from "react-hook-form";
import { useFormState, useWatch } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	type AmostraFormValues,
	INCIDENCIA_SUM_TARGET,
	INCIDENCIA_SUM_TOLERANCE,
	incidenciaServicos,
} from "@/features/amostras/fields";
import { fieldInputClassName } from "@/lib/formStyles";
import { cn } from "@/lib/utils";
import { maskDecimal, unmaskDecimal } from "@/lib/validators";

type IncidenciaServicosFieldProps = {
	control: Control<AmostraFormValues>;
	disabled?: boolean;
};

export function IncidenciaServicosField({
	control,
	disabled = false,
}: IncidenciaServicosFieldProps) {
	const values = useWatch({ control, name: "incidencias" });
	const { errors } = useFormState({ control, name: "incidencias" });

	const sum = (values ?? []).reduce((acc, item) => {
		const trimmed = String(item?.value ?? "").trim();
		if (!trimmed) return acc;
		const parsed = Number(unmaskDecimal(trimmed));
		return acc + (Number.isFinite(parsed) ? parsed : 0);
	}, 0);

	const sumOk = Math.abs(sum - INCIDENCIA_SUM_TARGET) <= INCIDENCIA_SUM_TOLERANCE;
	const sumLabel = sum.toFixed(2).replace(".", ",");
	const rootError = errors.incidencias as unknown as { message?: string } | undefined;

	return (
		<div className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				{incidenciaServicos.map((label, index) => (
					<FormField
						key={label}
						control={control}
						name={`incidencias.${index}.value` as FieldPath<AmostraFormValues>}
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel className="text-slate-200">{label}</FormLabel>
								<div className="relative">
									<Input
										name={field.name}
										ref={field.ref}
										onBlur={field.onBlur}
										onChange={(event) => field.onChange(maskDecimal(event.target.value))}
										value={typeof field.value === "string" ? field.value : ""}
										type="text"
										inputMode="numeric"
										placeholder="0,00"
										aria-invalid={fieldState.invalid}
										disabled={disabled}
										className={cn(fieldInputClassName, "pr-8")}
									/>
									<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
										%
									</span>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>
				))}
			</div>

			<div
				tabIndex={-1}
				aria-invalid={rootError?.message ? true : undefined}
				className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/60 px-4 py-3 aria-invalid:border-red-500/60 focus:outline-none"
			>
				<span className="text-sm text-slate-300">Total dos pesos</span>
				<span
					className={cn(
						"text-sm font-semibold tabular-nums",
						sumOk ? "text-emerald-400" : "text-amber-400",
					)}
				>
					{sumLabel}%
				</span>
			</div>

			{rootError?.message && (
				<p className="text-sm font-medium text-red-400">{rootError.message}</p>
			)}
		</div>
	);
}
