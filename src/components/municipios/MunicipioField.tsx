import { useQuery } from "@tanstack/react-query";
import type { Control } from "react-hook-form";
import {
	Combobox,
	ComboboxContent,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { AmostraFormValues } from "@/features/amostras/fields";
import { fetchMunicipios, type Municipio } from "@/lib/api";
import { inputGroupClassName, selectContentClassName } from "@/lib/formStyles";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

type MunicipioFieldProps = {
	control: Control<AmostraFormValues>;
	disabled?: boolean;
	missing?: boolean;
};

// Sugere os municípios já cadastrados, mas continua aceitando texto livre:
// a primeira amostra de um município novo precisa poder ser digitada.
export function MunicipioField({
	control,
	disabled = false,
	missing = false,
}: MunicipioFieldProps) {
	const { data: municipios } = useQuery<Municipio[]>({
		queryKey: queryKeys.municipios,
		queryFn: fetchMunicipios,
	});

	const nomes = municipios?.map((municipio) => municipio.nome) ?? [];

	return (
		<FormField
			control={control}
			name="municipio"
			render={({ field, fieldState }) => (
				<FormItem>
					<FormLabel className="text-slate-200">
						Município
						{missing && (
							<span className="ml-2 text-xs font-normal text-amber-400">Não identificado</span>
						)}
					</FormLabel>
					<Combobox
						items={nomes}
						inputValue={field.value ?? ""}
						onInputValueChange={(inputValue) => field.onChange(inputValue)}
						disabled={disabled}
					>
						<ComboboxInput
							ref={field.ref}
							onBlur={field.onBlur}
							placeholder="Não informado"
							aria-invalid={fieldState.invalid}
							disabled={disabled}
							className={cn(
								inputGroupClassName,
								"w-full",
								missing &&
									"border-amber-500/70 has-[[data-slot=input-group-control]:focus-visible]:border-amber-400",
							)}
						/>
						<ComboboxContent className={selectContentClassName}>
							<ComboboxList>
								{(nome: string) => (
									<ComboboxItem key={nome} value={nome} className="data-highlighted:bg-slate-700">
										{nome}
									</ComboboxItem>
								)}
							</ComboboxList>
						</ComboboxContent>
					</Combobox>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
