import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	type AmostraFormValues,
	areaFields,
	fieldInputClassName,
	fieldLabels,
	getInputMode,
	getPlaceholder,
	moneyFields,
	type TextField,
} from "./amostraFormSchema";

type AmostraTextFieldProps = {
	control: Control<AmostraFormValues>;
	name: TextField;
};

export function AmostraTextField({ control, name }: AmostraTextFieldProps) {
	const prefix = moneyFields.has(name) ? "R$" : areaFields.has(name) ? "m²" : null;

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
							className={cn(fieldInputClassName, prefix && "pl-10")}
						/>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
