import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import type { ReactElement, ReactNode } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { secondaryButtonClassName } from "@/lib/formStyles";

type ConfirmDeleteDialogProps = {
	title: string;
	description: ReactNode;
	pending: boolean;
	onConfirm: () => void;
	confirmLabel?: string;
	pendingLabel?: string;
	/** Close the dialog as soon as confirm is clicked (default). Pass false to keep it open, e.g. to show errors inside. */
	closeOnConfirm?: boolean;
	error?: ReactNode;
	/** Uncontrolled mode: element that opens the dialog. */
	trigger?: ReactElement;
	/** Controlled mode: pair with onOpenChange. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

export function ConfirmDeleteDialog({
	title,
	description,
	pending,
	onConfirm,
	confirmLabel = "Deletar",
	pendingLabel = "Deletando...",
	closeOnConfirm = true,
	error,
	trigger,
	open,
	onOpenChange,
}: ConfirmDeleteDialogProps) {
	const confirmButton = (
		<AlertDialogAction
			disabled={pending}
			onClick={onConfirm}
			className="bg-red-700 text-white hover:bg-red-600"
		>
			{pending ? pendingLabel : confirmLabel}
		</AlertDialogAction>
	);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			{trigger && <AlertDialogTrigger render={trigger} />}
			<AlertDialogContent className="dark border-white/10 bg-slate-900 text-slate-100">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-slate-100">{title}</AlertDialogTitle>
					<AlertDialogDescription className="text-slate-400">{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{error}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending} className={secondaryButtonClassName}>
						Cancelar
					</AlertDialogCancel>
					{closeOnConfirm ? (
						<AlertDialogPrimitive.Close disabled={pending} render={confirmButton} />
					) : (
						confirmButton
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
