import { cn } from "../lib/utils";
import { Input } from "./ui/input";

type FileDropZoneProps = {
	hint?: string;
	browseText?: string;
	accept?: string;
	multiple?: boolean;
	id: string;
	selectedFileName?: string;
	ariaDescribedBy?: string;
	ariaInvalid?: boolean;
	onChange?: (files: FileList | null) => void;
};

export function FileDropZone({
	hint = "or click to browse",
	browseText = "Browse",
	accept = ".pdf",
	multiple = true,
	id,
	selectedFileName,
	ariaDescribedBy,
	ariaInvalid = false,
	onChange,
}: FileDropZoneProps) {
	return (
		<div
			className={cn(
				"rounded-xl border border-dashed border-slate-700 bg-slate-900 transition-colors hover:border-slate-500 hover:bg-slate-900",
				ariaInvalid && "border-red-800/80",
			)}
		>
			<div className="flex items-center justify-between px-4 py-4">
				<div className="flex flex-col gap-1">
					<span className="text-sm text-slate-200">{browseText}</span>
					{hint ? (
						<span className="text-xs text-slate-500">{hint}</span>
					) : null}
				</div>
				<label
					htmlFor={id}
					className="cursor-pointer rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200"
				>
					Selecionar PDF
				</label>
				<Input
					id={id}
					type="file"
					multiple={multiple}
					accept={accept}
					className="hidden"
					aria-describedby={ariaDescribedBy}
					aria-invalid={ariaInvalid}
					onChange={(e) => onChange?.(e.target.files)}
				/>
			</div>
			{selectedFileName ? (
				<div className="border-t border-white/5 px-4 py-3 text-xs text-slate-400">
					Arquivo selecionado:{" "}
					<span className="font-medium text-slate-200">
						{selectedFileName}
					</span>
				</div>
			) : null}
		</div>
	);
}
