import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
	return (
		<main className="dark min-h-dvh w-full bg-slate-950 px-4 py-10 text-slate-100">
			<div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-5xl items-center justify-center">
				{children}
			</div>
		</main>
	);
}
