import { PlusIcon, Trash2Icon } from "lucide-react";
import type { Control, FieldPath } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
	type AmostraFormValues,
	fieldInputClassName,
	secondaryButtonClassName,
} from "./amostraFormSchema";

type DecimalArrayName = "incidencias" | "acumuladoProposto";

type DecimalArrayFieldProps<TName extends DecimalArrayName> = {
	control: Control<AmostraFormValues>;
	name: TName;
	title: string;
	disabled?: boolean;
	fieldArray: {
		fields: { id: string }[];
		append: (value: { value: string }) => void;
		remove: (index: number) => void;
	};
};

function valuePath<TName extends DecimalArrayName>(name: TName, index: number) {
	return `${name}.${index}.value` as FieldPath<AmostraFormValues>;
}

export function DecimalArrayField<TName extends DecimalArrayName>({
	control,
	name,
	title,
	disabled = false,
	fieldArray,
}: DecimalArrayFieldProps<TName>) {
	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div>
					<h3 className="text-sm font-semibold text-slate-100">{title}</h3>
					<FormDescription className="text-slate-500">
						Use duas casas decimais, por exemplo 12,34.
					</FormDescription>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					disabled={disabled}
					onClick={() => fieldArray.append({ value: "" })}
					className={secondaryButtonClassName}
				>
					<PlusIcon />
					Adicionar
				</Button>
			</div>
			{fieldArray.fields.map((item, index) => (
				<FormField
					key={item.id}
					control={control}
					name={valuePath(name, index)}
					render={({ field, fieldState }) => (
						<FormItem>
							<div className="flex gap-2">
								<Input
									name={field.name}
									ref={field.ref}
									onBlur={field.onBlur}
									onChange={field.onChange}
									value={typeof field.value === "string" ? field.value : ""}
									type="text"
									inputMode="decimal"
									placeholder="0,00"
									aria-invalid={fieldState.invalid}
									disabled={disabled}
									className={fieldInputClassName}
								/>
								<Button
									type="button"
									variant="outline"
									size="icon-lg"
									disabled={disabled || fieldArray.fields.length === 1}
									aria-label={`Remover valor ${index + 1}`}
									onClick={() => fieldArray.remove(index)}
									className={cn("h-10 w-10 rounded-md", secondaryButtonClassName)}
								>
									<Trash2Icon aria-hidden />
								</Button>
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			))}
		</div>
	);
}
