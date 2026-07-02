import { useMutation } from "@tanstack/react-query";
import { BotIcon, LoaderCircleIcon } from "lucide-react";
import { useId, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gerarAmostraIa } from "@/lib/api";
import { secondaryButtonClassName } from "@/lib/formStyles";
import { cn, getErrorMessage } from "@/lib/utils";
import type { AmostraFormValues } from "./fields";
import { amostraToFormValues } from "./transforms";

type PreencherComIaButtonProps = {
	onFill: (values: AmostraFormValues) => void;
	onStart?: () => void;
	disabled?: boolean;
};

export function PreencherComIaButton({ onFill, onStart, disabled }: PreencherComIaButtonProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();

	const mutation = useMutation({
		mutationFn: (pdf: File) => gerarAmostraIa(pdf),
		onSuccess: (amostra) => onFill(amostraToFormValues(amostra)),
		onError: (error) => toast.error(getErrorMessage(error)),
	});

	const isRunning = mutation.isPending;

	return (
		<>
			<Input
				ref={inputRef}
				id={inputId}
				type="file"
				accept=".pdf"
				className="hidden"
				onChange={(event) => {
					const pdf = event.target.files?.[0];
					event.target.value = "";
					if (!pdf) return;
					onStart?.();
					mutation.mutate(pdf);
				}}
			/>
			<Button
				type="button"
				variant="outline"
				disabled={disabled || isRunning}
				onClick={() => inputRef.current?.click()}
				className={cn("h-10", secondaryButtonClassName)}
			>
				{isRunning ? (
					<>
						<LoaderCircleIcon className="animate-spin" />
						Processando...
					</>
				) : (
					<>
						<BotIcon />
						Preencher com IA
					</>
				)}
			</Button>
		</>
	);
}
