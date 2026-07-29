import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Combobox,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
	ComboboxValue,
} from "@/components/ui/combobox";
import { fetchMunicipios, type Municipio } from "@/lib/api";
import { secondaryButtonClassName, selectContentClassName } from "@/lib/formStyles";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

type MunicipioFilterComboboxProps = {
	value: string;
	onValueChange: (municipio: string) => void;
	className?: string;
};

const todosLabel = "Todos os municípios";

export function MunicipioFilterCombobox({
	value,
	onValueChange,
	className,
}: MunicipioFilterComboboxProps) {
	const {
		data: municipios,
		isLoading,
		isError,
	} = useQuery<Municipio[]>({
		queryKey: queryKeys.municipios,
		queryFn: fetchMunicipios,
	});

	const nomes = municipios?.map((municipio) => municipio.nome) ?? [];
	const totais = new Map(municipios?.map((municipio) => [municipio.nome, municipio.totalAmostras]));

	return (
		<Combobox
			items={nomes}
			value={value}
			onValueChange={(nome) => onValueChange(nome ?? "")}
			disabled={isLoading || isError}
		>
			<ComboboxTrigger
				aria-label="Filtrar por município"
				render={
					<Button
						variant="outline"
						className={cn(
							secondaryButtonClassName,
							"h-10 w-56 justify-between font-normal",
							className,
						)}
					/>
				}
			>
				<ComboboxValue>
					<span className={value ? undefined : "text-slate-400"}>
						{isError ? "Erro ao carregar" : isLoading ? "Carregando..." : value || todosLabel}
					</span>
				</ComboboxValue>
			</ComboboxTrigger>

			<ComboboxContent className={selectContentClassName}>
				<ComboboxInput
					placeholder="Buscar município"
					showTrigger={false}
					className="text-slate-100"
				/>
				<ComboboxEmpty className="text-slate-400">Nenhum município encontrado.</ComboboxEmpty>
				<ComboboxList>
					<ComboboxItem value="" className="data-highlighted:bg-slate-700">
						{todosLabel}
					</ComboboxItem>
					<ComboboxCollection>
						{(nome: string) => (
							<ComboboxItem key={nome} value={nome} className="data-highlighted:bg-slate-700">
								<span className="flex-1 truncate">{nome}</span>
								<span className="text-xs text-slate-400">{totais.get(nome)}</span>
							</ComboboxItem>
						)}
					</ComboboxCollection>
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}
