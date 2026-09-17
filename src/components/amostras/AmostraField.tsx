import type { Control } from "react-hook-form";
import { MunicipioField } from "@/components/municipios/MunicipioField";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	type AmostraFormValues,
	fieldSpecs,
	getInputMode,
	type TextField,
} from "@/features/amostras/fields";
import { maskTextField } from "@/features/amostras/transforms";
import {
	fieldInputClassName,
	inputGroupClassName,
	selectContentClassName,
	selectItemClassName,
	selectTriggerClassName,
} from "@/lib/formStyles";
import { cn } from "@/lib/utils";
import { DataReferenciaField } from "./DataReferenciaField";

type AmostraFieldProps = {
	control: Control<AmostraFormValues>;
	name: TextField;
	disabled?: boolean;
	missing?: boolean;
};

export function AmostraFieldLabel({ name, missing }: { name: TextField; missing: boolean }) {
	return (
		<FormLabel className="text-slate-200">
			{fieldSpecs[name].label}
			{missing && <span className="ml-2 text-xs font-normal text-amber-400">Não identificado</span>}
		</FormLabel>
	);
}

// Decide como cada campo é renderizado a partir do registro em fieldSpecs.
export function AmostraField({
	control,
	name,
	disabled = false,
	missing = false,
}: AmostraFieldProps) {
	const spec = fieldSpecs[name];

	if (spec.kind === "date") {
		return <DataReferenciaField control={control} disabled={disabled} missing={missing} />;
	}

	if (spec.kind === "municipio") {
		return <MunicipioField control={control} disabled={disabled} missing={missing} />;
	}

	if (spec.kind === "enum") {
		return (
			<FormField
				control={control}
				name={name}
				render={({ field }) => (
					<FormItem>
						<AmostraFieldLabel name={name} missing={missing} />
						<Select
							value={field.value || undefined}
							onValueChange={(value) => field.onChange(value ?? "")}
							disabled={disabled}
						>
							<SelectTrigger
								className={cn(selectTriggerClassName, missing && "border-amber-500/70")}
							>
								<SelectValue placeholder="Não informado" />
							</SelectTrigger>
							<SelectContent alignItemWithTrigger={false} className={selectContentClassName}>
								{spec.options?.map((opt) => (
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

	if (spec.kind === "textarea") {
		return (
			<FormField
				control={control}
				name={name}
				render={({ field, fieldState }) => (
					<FormItem>
						<AmostraFieldLabel name={name} missing={missing} />
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

	const prefix = spec.kind === "money" ? "R$" : null;
	const suffix = spec.kind === "area" ? "m²" : spec.kind === "meter" ? "m" : null;
	const hasAffix = prefix != null || suffix != null;

	return (
		<FormField
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FormItem>
					<AmostraFieldLabel name={name} missing={missing} />
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
								placeholder={spec.placeholder}
								aria-invalid={fieldState.invalid}
								disabled={disabled}
								onChange={(event) => field.onChange(maskTextField(name, event.target.value))}
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
							placeholder={spec.placeholder}
							aria-invalid={fieldState.invalid}
							disabled={disabled}
							onChange={(event) => field.onChange(maskTextField(name, event.target.value))}
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
