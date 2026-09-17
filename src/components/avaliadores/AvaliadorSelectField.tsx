import { useQuery } from "@tanstack/react-query";
import type { Control } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { AmostraFormValues } from "@/features/amostras/fields";
import { type Avaliador, fetchAvaliadores } from "@/lib/api";
import {
	selectContentClassName,
	selectItemClassName,
	selectTriggerClassName,
} from "@/lib/formStyles";
import { queryKeys } from "@/lib/queryKeys";

type AvaliadorSelectFieldProps = {
	control: Control<AmostraFormValues>;
	disabled?: boolean;
};

// A obrigatoriedade vem do schema do formulário, não daqui.
export function AvaliadorSelectField({ control, disabled = false }: AvaliadorSelectFieldProps) {
	const {
		data: avaliadores,
		isLoading: avaliadoresLoading,
		isError: avaliadoresIsError,
	} = useQuery<Avaliador[]>({
		queryKey: queryKeys.avaliadores,
		queryFn: fetchAvaliadores,
	});

	const getAvaliadorNome = (avaliadorId: string) =>
		avaliadores?.find((avaliador) => String(avaliador.id) === avaliadorId)?.nome;

	return (
		<FormField
			control={control}
			name="avaliadorId"
			render={({ field, fieldState }) => (
				<FormItem>
					<Select
						value={field.value || undefined}
						disabled={avaliadoresLoading || disabled}
						onValueChange={(value) => field.onChange(value ?? "")}
					>
						<SelectTrigger
							aria-label="Selecione um avaliador"
							className={selectTriggerClassName}
							aria-invalid={fieldState.invalid}
						>
							<SelectValue
								className="text-slate-100"
								placeholder={
									avaliadoresLoading
										? "Carregando..."
										: avaliadoresIsError
											? "Erro ao carregar"
											: "Selecione um avaliador"
								}
							>
								{field.value ? getAvaliadorNome(field.value) : null}
							</SelectValue>
						</SelectTrigger>
						<SelectContent alignItemWithTrigger={false} className={selectContentClassName}>
							{avaliadores?.map((avaliador) => (
								<SelectItem
									key={avaliador.id}
									value={String(avaliador.id)}
									className={selectItemClassName}
								>
									{avaliador.nome}
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
