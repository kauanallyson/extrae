import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
			<label
				htmlFor={checkboxId}
				className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-600 bg-slate-800 px-3 py-3 text-sm text-slate-100"
			>
				<Switch
					id={checkboxId}
					checked={gerarRae}
					disabled={isSubmitting}
					onCheckedChange={(checked) => onGerarRaeChange(checked)}
					className="data-checked:bg-emerald-500 data-unchecked:bg-slate-600 focus-visible:ring-slate-400/40"
				/>
				Gerar planilha RAE após salvar
			</label>

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
