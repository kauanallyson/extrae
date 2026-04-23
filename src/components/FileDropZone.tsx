type FileDropZoneProps = {
	label?: string;
	hint?: string;
	browseText?: string;
	accept?: string;
	multiple?: boolean;
	onChange?: (files: FileList | null) => void;
};

export function FileDropZone({
	label = "Drop files here",
	hint = "or click to browse",
	browseText = "Browse",
	accept = ".pdf",
	multiple = true,
	onChange,
}: FileDropZoneProps) {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg p-4">
				<div className="flex flex-col">
					<span className="text-sm text-slate-300">{label}</span>
					<span className="text-xs text-slate-500">{hint}</span>
				</div>
				<label className="bg-transparent border border-slate-500 hover:border-slate-300 text-slate-200 text-sm px-4 py-2 rounded cursor-pointer transition-colors">
					{browseText}
					<input
						type="file"
						multiple={multiple}
						accept={accept}
						className="hidden"
						onChange={(e) => onChange?.(e.target.files)}
					/>
				</label>
			</div>
		</div>
	);
}
