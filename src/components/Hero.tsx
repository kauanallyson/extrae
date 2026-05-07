import {
	ArrowRightIcon,
	FileSpreadsheetIcon,
	MapPinnedIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { buttonVariants } from "./ui/button";

export function Hero() {
	return (
		<section className="grid w-full gap-10 py-8 md:grid-cols-[1.05fr_0.95fr] md:items-center md:py-14">
			<div className="space-y-7">
				<div className="inline-flex items-center rounded-md border border-white/10 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-300">
					PDF, IA e mapa em um fluxo simples
				</div>
				<div className="space-y-4">
					<h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-slate-50 sm:text-5xl">
						Extraia dados de laudos e colete amostras.
					</h1>
					<p className="max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
						O EXTRAE, extrai os dados dos laudos de avaliação e
						salva as amostras coletadas em um banco de dados
						centralizado e de fácil acesso.
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">
					<Link
						to="/extrair-amostra"
						className={cn(
							buttonVariants(),
							"h-11 rounded-md bg-slate-100 px-5 text-slate-950 hover:bg-slate-200",
						)}
					>
						<FileSpreadsheetIcon />
						Extrair amostra
					</Link>
					<Link
						to="/mapa"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"h-11 rounded-md border-slate-700 bg-slate-900 px-5 text-slate-100 hover:bg-slate-800 hover:text-slate-50",
						)}
					>
						<MapPinnedIcon />
						Ver mapa
					</Link>
				</div>
			</div>

			<div className="rounded-xl border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black/30">
				<div className="space-y-4">
					<div className="flex items-center justify-between border-b border-white/10 pb-4">
						<div>
							<p className="text-sm font-medium text-slate-100">
								Fluxo da amostra
							</p>
							<p className="text-xs text-slate-500">
								Do laudo ao acompanhamento geografico
							</p>
						</div>
						<div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
							Automatizado
						</div>
					</div>

					<div className="grid gap-3">
						{[
							{
								title: "1. Envie o laudo",
								description:
									"Selecione o PDF e o avaliador responsavel.",
							},
							{
								title: "2. Gere a amostra",
								description:
									"A IA identifica os dados importantes do documento.",
							},
							{
								title: "3. Baixe e visualize",
								description:
									"A planilha e entregue pronta e as amostras aparecem no mapa.",
							},
						].map((item) => (
							<div
								key={item.title}
								className="flex gap-3 rounded-lg border border-white/10 bg-slate-900 p-4"
							>
								<div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-950">
									<ArrowRightIcon className="size-4" />
								</div>
								<div>
									<p className="text-sm font-medium text-slate-100">
										{item.title}
									</p>
									<p className="mt-1 text-sm leading-6 text-slate-400">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
