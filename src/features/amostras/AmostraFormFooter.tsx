import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { secondaryButtonClassName } from "@/lib/formStyles";
import { cn } from "@/lib/utils";

type AmostraFormFooterProps = {
	checkboxId: string;
	gerarRae: boolean;
	onGerarRaeChange: (value: boolean) => void;
	isSubmitting: boolean;
	resetLabel: string;
	onReset: () => void;
	resetDisabled?: boolean;
};

export function AmostraFormFooter({
	checkboxId,
	gerarRae,
	onGerarRaeChange,
	isSubmitting,
	resetLabel,
	onReset,
	resetDisabled = false,
}: AmostraFormFooterProps) {
	return (
		<div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
			<div className="flex items-center gap-3 rounded-md border border-slate-600 bg-slate-800 px-3 py-3">
				<Checkbox
					id={checkboxId}
					checked={gerarRae}
					disabled={isSubmitting}
					onCheckedChange={(checked) => onGerarRaeChange(checked === true)}
					className="border-slate-500 bg-slate-700 text-slate-900 data-checked:border-slate-100 data-checked:bg-slate-100"
				/>
				<label htmlFor={checkboxId} className="cursor-pointer text-sm text-slate-100">
					Gerar planilha RAE após salvar
				</label>
			</div>

			<div className="flex gap-3 sm:justify-end">
				<Button
					type="button"
					variant="outline"
					onClick={onReset}
					disabled={resetDisabled}
					className={cn("h-10", secondaryButtonClassName)}
				>
					{resetLabel}
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting}
					className="h-10 bg-slate-100 text-slate-900 hover:bg-slate-200"
				>
					{isSubmitting ? (
						<>
							<LoaderCircleIcon className="animate-spin" />
							Salvando...
						</>
					) : (
						<>
							<CheckCircle2Icon />
							Salvar dados
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
