import { type DragEvent, useState } from "react";
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

function matchesAccept(file: File, accept: string): boolean {
	const patterns = accept
		.split(",")
		.map((p) => p.trim().toLowerCase())
		.filter(Boolean);
	if (patterns.length === 0) return true;
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return patterns.some((pattern) => {
		if (pattern.startsWith(".")) return name.endsWith(pattern);
		if (pattern.endsWith("/*")) return type.startsWith(pattern.slice(0, -1));
		return type === pattern;
	});
}

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
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const dropped = Array.from(e.dataTransfer.files).filter((file) => matchesAccept(file, accept));
		if (dropped.length === 0) return;

		const transfer = new DataTransfer();
		for (const file of multiple ? dropped : dropped.slice(0, 1)) {
			transfer.items.add(file);
		}
		onChange?.(transfer.files);
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: drag-drop has no keyboard equivalent; the file input below is the accessible path
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			className={cn(
				"rounded-xl border border-dashed border-slate-600 bg-slate-800 transition-colors",
				isDragging && "border-slate-300 bg-slate-700/60",
				ariaInvalid && "border-red-800/80",
			)}
		>
			<div className="flex items-center justify-between px-4 py-4">
				<div className="flex flex-col gap-1">
					<span className="text-sm text-slate-200">{browseText}</span>
					{hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
				</div>
				<label
					htmlFor={id}
					className="cursor-pointer rounded-md border border-slate-500 bg-slate-700 px-3 py-2 text-xs font-medium text-slate-100 hover:bg-slate-600"
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
				<div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">
					Arquivo selecionado:{" "}
					<span className="font-medium text-slate-200">{selectedFileName}</span>
				</div>
			) : null}
		</div>
	);
}
