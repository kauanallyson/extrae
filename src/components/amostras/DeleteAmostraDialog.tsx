import { Trash2Icon } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/shared/ConfirmDeleteDialog";
import { buttonVariants } from "@/components/ui/button";
import { useDeleteAmostra } from "@/features/amostras/useSaveAmostra";
import { cn } from "@/lib/utils";

// Botão + confirmação + mutação: deletar uma amostra é sempre a mesma ação.
export function DeleteAmostraDialog({ amostraId }: { amostraId: number }) {
	const deleteMutation = useDeleteAmostra(amostraId);

	return (
		<ConfirmDeleteDialog
			trigger={
				<button
					type="button"
					className={cn(
						buttonVariants({ variant: "ghost", size: "icon-sm" }),
						"text-red-400 hover:bg-red-950/60 hover:text-red-300",
					)}
					title="Deletar amostra"
				>
					<Trash2Icon />
				</button>
			}
			title="Deletar amostra?"
			description="Essa ação não pode ser desfeita. A amostra será permanentemente removida."
			pending={deleteMutation.isPending}
			onConfirm={() => deleteMutation.mutate()}
		/>
	);
}
