import { AlertDialog } from "@base-ui/react";
import type { ReactElement, ReactNode } from "react";

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
		<button
			type="button"
			className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
			disabled={pending}
			onClick={onConfirm}
		>
			{pending ? pendingLabel : confirmLabel}
		</button>
	);

	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			{trigger && <AlertDialog.Trigger render={trigger} />}
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
				<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
					<AlertDialog.Title className="text-base font-semibold text-slate-100">
						{title}
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-2 text-sm text-slate-400">
						{description}
					</AlertDialog.Description>
					{error}
					<div className="mt-5 flex justify-end gap-3">
						<AlertDialog.Close
							render={
								<button
									type="button"
									className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
									disabled={pending}
								>
									Cancelar
								</button>
							}
						/>
						{closeOnConfirm ? <AlertDialog.Close render={confirmButton} /> : confirmButton}
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
