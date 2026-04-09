import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex items-center justify-center min-h-dvh w-dvw bg-slate-900 text-slate-100">
      {children}
    </main>
  );
}
