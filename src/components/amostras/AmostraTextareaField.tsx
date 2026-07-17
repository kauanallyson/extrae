import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { type AmostraFormValues, fieldLabels, type TextField } from "@/features/amostras/fields";
import { cn } from "@/lib/utils";

type AmostraTextareaFieldProps = {
	control: Control<AmostraFormValues>;
	name: TextField;
	disabled?: boolean;
	missing?: boolean;
};

export function AmostraTextareaField({
	control,
	name,
	disabled = false,
	missing = false,
}: AmostraTextareaFieldProps) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem>
					<FormLabel className="text-slate-200">
						{fieldLabels[name]}
						{missing && (
							<span className="ml-2 text-xs font-normal text-amber-400">Não identificado</span>
						)}
					</FormLabel>
					<Textarea
						{...field}
						rows={4}
						aria-invalid={fieldState.invalid}
						disabled={disabled}
						className={cn(
							"min-h-24 rounded-md border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 hover:border-slate-500 hover:bg-slate-700 focus-visible:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700",
							missing && "border-amber-500/70 focus-visible:border-amber-400",
						)}
					/>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
