import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import {
	type AmostraFormValues,
	areaFields,
	fieldLabels,
	getInputMode,
	getPlaceholder,
	meterFields,
	moneyFields,
	type TextField,
} from "@/features/amostras/fields";
import { fieldInputClassName, inputGroupClassName } from "@/lib/formStyles";
import { cn } from "@/lib/utils";
import { maskCep, maskDecimal, normalizeCoordenadaDms } from "@/lib/validators";

type AmostraTextFieldProps = {
	control: Control<AmostraFormValues>;
	name: TextField;
	disabled?: boolean;
	missing?: boolean;
};

const coordenadaFields = new Set<TextField>(["coordenadaS", "coordenadaW"]);
const decimalMaskFields = new Set<TextField>([...moneyFields, ...areaFields, ...meterFields]);

function transformValue(name: TextField, value: string): string {
	if (name === "cep") return maskCep(value);
	if (coordenadaFields.has(name)) return normalizeCoordenadaDms(value);
	if (decimalMaskFields.has(name)) return maskDecimal(value);
	return value;
}

export function AmostraTextField({
	control,
	name,
	disabled = false,
	missing = false,
}: AmostraTextFieldProps) {
	const prefix = moneyFields.has(name) ? "R$" : null;
	const suffix = areaFields.has(name) ? "m²" : meterFields.has(name) ? "m" : null;
	const hasAffix = prefix != null || suffix != null;

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
					{hasAffix ? (
						<InputGroup
							className={cn(
								inputGroupClassName,
								missing &&
									"border-amber-500/70 has-[[data-slot=input-group-control]:focus-visible]:border-amber-400",
							)}
						>
							{prefix && (
								<InputGroupAddon>
									<InputGroupText className="text-slate-400">{prefix}</InputGroupText>
								</InputGroupAddon>
							)}
							<InputGroupInput
								{...field}
								inputMode={getInputMode(name)}
								placeholder={getPlaceholder(name)}
								aria-invalid={fieldState.invalid}
								disabled={disabled}
								onChange={(event) => field.onChange(transformValue(name, event.target.value))}
								className="text-slate-100 placeholder:text-slate-500"
							/>
							{suffix && (
								<InputGroupAddon align="inline-end">
									<InputGroupText className="text-slate-400">{suffix}</InputGroupText>
								</InputGroupAddon>
							)}
						</InputGroup>
					) : (
						<Input
							{...field}
							type="text"
							inputMode={getInputMode(name)}
							placeholder={getPlaceholder(name)}
							aria-invalid={fieldState.invalid}
							disabled={disabled}
							onChange={(event) => field.onChange(transformValue(name, event.target.value))}
							className={cn(
								fieldInputClassName,
								missing && "border-amber-500/70 focus-visible:border-amber-400",
							)}
						/>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
