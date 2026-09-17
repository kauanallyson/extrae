import { cn } from "@/lib/utils";

export function DetailItem({
	label,
	value,
	wrap = false,
	className,
}: {
	label: string;
	value: string | null | undefined;
	wrap?: boolean;
	className?: string;
}) {
	return (
		<div className={cn("space-y-1", className)}>
			<p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
			<p className={cn("text-sm text-slate-100", wrap && "whitespace-pre-wrap wrap-break-word")}>
				{value || "-"}
			</p>
		</div>
	);
}
