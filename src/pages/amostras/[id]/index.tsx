import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, PencilIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AmostraSection } from "@/components/amostras/AmostraSection";
import { DeleteAmostraDialog } from "@/components/amostras/DeleteAmostraDialog";
import { DetailItem } from "@/components/amostras/DetailItem";
import { SectionGrid } from "@/components/amostras/SectionGrid";
import { Layout } from "@/components/layout/Layout";
import { PageLoading } from "@/components/shared/PageLoading";
import { PageMessage } from "@/components/shared/PageMessage";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	fieldGroups,
	fieldSpecs,
	identificationGroupTitle,
	incidenciaServicos,
} from "@/features/amostras/fields";
import { formatTextField } from "@/features/amostras/transforms";
import { type Amostra, type Avaliador, fetchAmostra, fetchAvaliadores } from "@/lib/api";
import { formatDecimal } from "@/lib/format";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";

export function AmostraDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const amostraId = Number(id);

	const {
		data: amostra,
		isLoading,
		error,
	} = useQuery<Amostra, Error>({
		queryKey: queryKeys.amostra(amostraId),
		queryFn: () => fetchAmostra(amostraId),
		enabled: !Number.isNaN(amostraId),
	});

	const { data: avaliadores } = useQuery<Avaliador[]>({
		queryKey: queryKeys.avaliadores,
		queryFn: fetchAvaliadores,
	});

	const avaliador = avaliadores?.find((a) => a.id === amostra?.avaliadorId);

	useEffect(() => {
		if (error) toast.error(error.message ?? "Erro ao carregar amostra.");
	}, [error]);

	if (isLoading) return <PageLoading label="Carregando amostra..." />;
	if (error) return <PageMessage>Erro ao carregar amostra.</PageMessage>;
	if (!amostra) return <PageMessage>Amostra não encontrada.</PageMessage>;

	const telefoneFormatted =
		amostra.ddd && amostra.telefone ? `(${amostra.ddd}) ${amostra.telefone}` : "-";

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Link
				to="/amostras"
				className={cn(
					buttonVariants({ variant: "ghost", size: "sm" }),
					"mb-4 -ml-2 text-slate-400 hover:text-slate-100",
				)}
			>
				<ArrowLeftIcon className="h-4 w-4" />
				Voltar
			</Link>
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="px-6 pt-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<CardTitle className="text-3xl text-slate-50">
								{amostra.proponente || `Amostra #${amostra.id}`}
							</CardTitle>
							<CardDescription className="mt-1 text-slate-400">
								{[amostra.endereco, amostra.municipio, amostra.uf].filter(Boolean).join(", ") ||
									`Amostra #${amostra.id}`}
							</CardDescription>
						</div>
						<div className="flex shrink-0 gap-2">
							<Link
								to={`/amostras/${amostra.id}/editar`}
								className={cn(
									buttonVariants({ size: "sm" }),
									"bg-slate-100 text-slate-900 hover:bg-slate-200",
								)}
							>
								<PencilIcon />
								Editar
							</Link>
							<DeleteAmostraDialog amostraId={amostraId} />
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-8 px-6 pb-6">
					<AmostraSection title="Avaliador">
						<SectionGrid>
							<DetailItem label="Nome" value={avaliador?.nome ?? `ID ${amostra.avaliadorId}`} />
							{avaliador?.nomeFantasia && (
								<DetailItem label="Nome fantasia" value={avaliador.nomeFantasia} />
							)}
							{avaliador?.registroCrea && (
								<DetailItem label="CREA" value={avaliador.registroCrea} />
							)}
						</SectionGrid>
					</AmostraSection>

					<AmostraSection title="Identificação" description="Dados do proponente e contato.">
						<SectionGrid>
							<DetailItem label="Proponente" value={amostra.proponente} />
							<DetailItem label="CPF" value={amostra.cpf} />
							<DetailItem label="CNPJ" value={amostra.cnpj} />
							<DetailItem label="Telefone" value={telefoneFormatted} />
						</SectionGrid>
					</AmostraSection>

					{fieldGroups
						.filter((g) => g.title !== identificationGroupTitle)
						.map((group) => (
							<AmostraSection key={group.title} title={group.title} description={group.description}>
								<SectionGrid>
									{group.fields.map((field) => (
										<DetailItem
											key={field}
											label={fieldSpecs[field].label}
											value={formatTextField(field, amostra[field])}
											wrap={fieldSpecs[field].kind === "textarea"}
											className={
												fieldSpecs[field].kind === "textarea"
													? "sm:col-span-2 lg:col-span-3"
													: undefined
											}
										/>
									))}
								</SectionGrid>
							</AmostraSection>
						))}

					<AmostraSection
						title="Incidências e acumulados"
						description="Valores de incidências e acumulados da avaliação."
					>
						<div className="grid gap-6 lg:grid-cols-2">
							<div className="space-y-2">
								<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
									Incidências
								</p>
								<table className="w-full text-sm">
									<thead>
										<tr className="border-b border-white/10 text-left text-xs text-slate-500">
											<th className="pb-1 font-medium">Serviço</th>
											<th className="pb-1 text-right font-medium">Peso</th>
										</tr>
									</thead>
									<tbody>
										{incidenciaServicos.map((servico, i) => (
											<tr key={servico} className="border-b border-white/5 last:border-0">
												<td className="py-1.5 text-slate-300">{servico}</td>
												<td className="py-1.5 text-right tabular-nums text-slate-100">
													{amostra.incidencias?.[i] != null
														? `${formatDecimal(amostra.incidencias[i])}%`
														: "-"}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="space-y-2">
								<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
									Acumulado proposto
								</p>
								{amostra.acumuladoProposto && amostra.acumuladoProposto.length > 0 ? (
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-white/10 text-left text-xs text-slate-500">
												<th className="pb-1 font-medium">#</th>
												<th className="pb-1 text-right font-medium">Valor</th>
											</tr>
										</thead>
										<tbody>
											{amostra.acumuladoProposto.map((v, i) => (
												// biome-ignore lint/suspicious/noArrayIndexKey: positional values without stable id
												<tr key={`acum-${i}`} className="border-b border-white/5 last:border-0">
													<td className="py-1.5 text-slate-500">{i + 1}</td>
													<td className="py-1.5 text-right tabular-nums text-slate-100">
														{formatDecimal(v)}%
													</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<p className="text-sm text-slate-500">-</p>
								)}
							</div>
						</div>
					</AmostraSection>
				</CardContent>
			</Card>
		</Layout>
	);
}
