import { FormLabel } from "@/components/ui/form";
import { fieldSpecs, type TextField } from "@/features/amostras/fields";

export function AmostraFieldLabel({ name, missing }: { name: TextField; missing: boolean }) {
	return (
		<FormLabel className="text-slate-200">
			{fieldSpecs[name].label}
			{missing && <span className="ml-2 text-xs font-normal text-amber-400">Não identificado</span>}
		</FormLabel>
	);
}
