import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Indicador({
	label,
	descricao,
	valor,
	geral,
}: {
	label: string;
	descricao: string;
	valor: string;
	geral?: string;
}) {
	return (
		<div className="relative rounded-lg border border-white/10 bg-slate-800/50 px-4 py-3">
			<Tooltip>
				<TooltipTrigger
					aria-label={`O que é ${label}`}
					className="absolute top-2.5 right-2.5 text-slate-500 hover:text-slate-300"
				>
					<InfoIcon className="h-3.5 w-3.5" />
				</TooltipTrigger>
				<TooltipContent>{descricao}</TooltipContent>
			</Tooltip>
			<p className="text-xs text-slate-400">{label}</p>
			<p className="mt-1 text-lg font-semibold text-slate-100">{valor}</p>
			{geral && <p className="mt-0.5 text-xs text-slate-500">Ceará: {geral}</p>}
		</div>
	);
}
