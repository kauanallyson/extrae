import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }: { children: ReactNode }) {
	return (
		<main className="dark min-h-dvh w-full bg-slate-900 text-slate-100">
			<Navbar />
			<div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-5xl items-center justify-center px-4 py-10">
				{children}
			</div>
		</main>
	);
}
