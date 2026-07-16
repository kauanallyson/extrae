import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type AmostraFormValues, fieldLabels, type TextField } from "@/features/amostras/fields";
import {
	selectContentClassName,
	selectItemClassName,
	selectTriggerClassName,
} from "@/lib/formStyles";
import { cn } from "@/lib/utils";

type AmostraSelectFieldProps = {
	control: Control<AmostraFormValues>;
	name: TextField;
	options: readonly string[];
	disabled?: boolean;
	missing?: boolean;
};

export function AmostraSelectField({
	control,
	name,
	options,
	disabled = false,
	missing = false,
}: AmostraSelectFieldProps) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-slate-200">
						{fieldLabels[name]}
						{missing && (
							<span className="ml-2 text-xs font-normal text-amber-400">Não identificado</span>
						)}
					</FormLabel>
					<Select
						value={field.value || undefined}
						onValueChange={(value) => field.onChange(value ?? "")}
						disabled={disabled}
					>
						<SelectTrigger className={cn(selectTriggerClassName, missing && "border-amber-500/70")}>
							<SelectValue placeholder="Não informado" />
						</SelectTrigger>
						<SelectContent alignItemWithTrigger={false} className={selectContentClassName}>
							{options.map((opt) => (
								<SelectItem key={opt} value={opt} className={selectItemClassName}>
									{opt}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
