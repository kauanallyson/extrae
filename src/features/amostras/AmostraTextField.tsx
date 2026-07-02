import type { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import { fieldInputClassName, inputGroupClassName } from "@/lib/formStyles";
import { maskCep } from "@/lib/validators";
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
	const hasAffix = prefix != null || suffix != null;

	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem>
					<FormLabel className="text-slate-200">{fieldLabels[name]}</FormLabel>
					{hasAffix ? (
						<InputGroup className={inputGroupClassName}>
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
							onChange={
								name === "cep"
									? (event) => field.onChange(maskCep(event.target.value))
									: field.onChange
							}
							className={fieldInputClassName}
						/>
					)}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
