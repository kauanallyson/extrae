import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type AmostraFormValues, fieldLabels } from "@/features/amostras/fields";
import { secondaryButtonClassName } from "@/lib/formStyles";
import { cn } from "@/lib/utils";

const ISO_DATE = "yyyy-MM-dd";

function parseIsoDate(value: string): Date | undefined {
	if (!value) return undefined;
	const parsed = parse(value, ISO_DATE, new Date());
	return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

type DataReferenciaFieldProps = {
	control: Control<AmostraFormValues>;
	disabled?: boolean;
	missing?: boolean;
};

export function DataReferenciaField({
	control,
	disabled = false,
	missing = false,
}: DataReferenciaFieldProps) {
	const [open, setOpen] = useState(false);
	const endMonth = new Date(new Date().getFullYear() + 1, 11);

	return (
		<FormField
			control={control}
			name="dataReferencia"
			render={({ field, fieldState }) => {
				const selected = parseIsoDate(field.value);
				return (
					<FormItem className="flex flex-col">
						<FormLabel className="text-slate-200">
							{fieldLabels.dataReferencia}
							{missing && (
								<span className="ml-2 text-xs font-normal text-amber-400">Não identificado</span>
							)}
						</FormLabel>
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger
								render={
									<Button
										type="button"
										variant="outline"
										disabled={disabled}
										aria-invalid={fieldState.invalid}
										className={cn(
											"h-10 w-full justify-between font-normal",
											secondaryButtonClassName,
											!selected && "text-slate-500",
											missing && "border-amber-500/70",
										)}
									>
										{selected
											? format(selected, "dd/MM/yyyy", { locale: ptBR })
											: "Selecione a data"}
										<CalendarIcon className="text-slate-400" />
									</Button>
								}
							/>
							<PopoverContent
								align="start"
								className="dark w-auto border-slate-600 bg-slate-800 p-0 text-slate-100"
							>
								<Calendar
									mode="single"
									locale={ptBR}
									selected={selected}
									defaultMonth={selected}
									captionLayout="dropdown"
									startMonth={new Date(2000, 0)}
									endMonth={endMonth}
									onSelect={(date) => {
										field.onChange(date ? format(date, ISO_DATE) : "");
										setOpen(false);
									}}
								/>
							</PopoverContent>
						</Popover>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
