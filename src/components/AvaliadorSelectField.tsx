import { useQuery } from "@tanstack/react-query";
import type { Control, FieldValues, Path } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type Avaliador, fetchAvaliadores } from "@/lib/api";
import { cn } from "@/lib/utils";

type AvaliadorSelectFieldProps<TFieldValues extends FieldValues> = {
	control: Control<TFieldValues>;
	name: Path<TFieldValues>;
	disabled?: boolean;
	triggerClassName?: string;
};

export function AvaliadorSelectField<TFieldValues extends FieldValues>({
	control,
	name,
	disabled = false,
	triggerClassName,
}: AvaliadorSelectFieldProps<TFieldValues>) {
	const {
		data: avaliadores,
		isLoading: avaliadoresLoading,
		isError: avaliadoresIsError,
	} = useQuery<Avaliador[]>({
		queryKey: ["avaliadores"],
		queryFn: fetchAvaliadores,
	});

	const getAvaliadorNome = (avaliadorId: string) =>
		avaliadores?.find((avaliador) => String(avaliador.id) === avaliadorId)?.nome;

	return (
		<FormField
			control={control}
			name={name}
			rules={{ required: "Selecione um avaliador." }}
			render={({ field, fieldState }) => (
				<FormItem>
					<FormLabel htmlFor="avaliador-trigger" className="text-slate-200">
						Avaliador
					</FormLabel>
					<Select
						value={field.value || undefined}
						disabled={avaliadoresLoading || disabled}
						onValueChange={(value) => field.onChange(value ?? "")}
					>
						<SelectTrigger
							id="avaliador-trigger"
							className={cn(
								"h-10 min-h-10 w-full rounded-md border-slate-600 bg-slate-800 px-2.5 py-1 text-slate-100 hover:text-slate-100 data-placeholder:text-slate-500 data-[size=default]:h-10 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 [&>svg]:text-slate-400",
								triggerClassName,
							)}
							aria-invalid={fieldState.invalid}
						>
							<SelectValue
								className="text-slate-100"
								placeholder={
									avaliadoresLoading
										? "Carregando!"
										: avaliadoresIsError
											? "Erro ao carregar"
											: "Selecione um avaliador"
								}
							>
								{field.value ? getAvaliadorNome(field.value) : null}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="border border-slate-600 bg-slate-800 text-slate-100">
							{avaliadores?.map((avaliador) => (
								<SelectItem
									key={avaliador.id}
									value={String(avaliador.id)}
									className="focus:bg-slate-700 focus:text-slate-50"
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
