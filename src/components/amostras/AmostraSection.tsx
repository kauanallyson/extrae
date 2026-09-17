import type { ReactNode } from "react";

export function AmostraSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<div className="space-y-3">
			<div className="border-b border-white/10 pb-2">
				<h3 className="text-base font-semibold text-slate-200">{title}</h3>
				{description && <p className="text-xs text-slate-500">{description}</p>}
			</div>
			{children}
		</div>
	);
}
