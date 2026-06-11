import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fieldInputClassName } from "@/lib/formStyles";
import { cn } from "@/lib/utils";
import {
	type AmostraFormValues,
	areaFields,
	fieldLabels,
	getInputMode,
	getPlaceholder,
	meterFields,
	moneyFields,
	type TextField,
} from "./fields";

type AmostraTextFieldProps = {
	control: Control<AmostraFormValues>;
	name: TextField;
	disabled?: boolean;
};

export function AmostraTextField({ control, name, disabled = false }: AmostraTextFieldProps) {
	const prefix = moneyFields.has(name) ? "R$" : null;
	const suffix = areaFields.has(name) ? "m²" : meterFields.has(name) ? "m" : null;
	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem>
					<FormLabel className="text-slate-200">{fieldLabels[name]}</FormLabel>
					<div className="relative">
						{prefix && (
							<span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
								{prefix}
							</span>
						)}
						<Input
							{...field}
							type={name === "dataReferencia" ? "date" : "text"}
							inputMode={getInputMode(name)}
							placeholder={getPlaceholder(name)}
							aria-invalid={fieldState.invalid}
							disabled={disabled}
							className={cn(fieldInputClassName, prefix && "pl-10", suffix && "pr-10")}
						/>
						{suffix && (
							<span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-400">
								{suffix}
							</span>
						)}
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
