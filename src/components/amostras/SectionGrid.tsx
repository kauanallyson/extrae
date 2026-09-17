import type { ReactNode } from "react";

export function SectionGrid({ children }: { children: ReactNode }) {
	return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
