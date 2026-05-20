import { Hero } from "@/components/Hero";
import { Layout } from "../components/Layout";

export function HomePage() {
	return (
		<Layout contentClassName="block py-8 sm:py-12">
			<div className="space-y-12">
				<Hero />

				<section className="grid gap-4 border-t border-white/10 pt-10 sm:grid-cols-3">
					{[
						{
							value: "PDF",
							label: "Entrada simples para carregar laudos.",
						},
						{
							value: "RAE",
							label: "Gere uma planilha compatível com a RAE de forma automatizada.",
						},
						{
							value: "Mapa",
							label: "Amostras organizadas por coordenadas.",
						},
					].map((item) => (
						<div
							key={item.value}
							className="rounded-lg border border-slate-600 bg-slate-800 p-5 shadow-xl shadow-black/20"
						>
							<p className="text-2xl font-semibold text-slate-50">{item.value}</p>
							<p className="mt-2 text-sm leading-6 text-slate-400">{item.label}</p>
						</div>
					))}
				</section>
			</div>
		</Layout>
	);
}
