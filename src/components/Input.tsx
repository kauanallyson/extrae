import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
};

export function Input({ label, className, ...props }: InputProps) {
	return (
		<label className="flex flex-col gap-1 text-sm text-slate-300">
			{label}
			<input
				className={`bg-slate-800 border border-slate-600 focus:border-slate-400 text-slate-200 text-sm px-3 py-2 rounded outline-none transition-colors ${className?.trim() ?? ""}`}
				{...props}
			/>
		</label>
	);
}
