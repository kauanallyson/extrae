import { AlertDialog } from "@base-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, LoaderCircleIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	areaFields,
	fieldGroups,
	fieldLabels,
	identificationGroupTitle,
	incidenciaServicos,
	meterFields,
	moneyFields,
	type TextField,
} from "@/features/amostras/amostraFormSchema";
import {
	type Amostra,
	type Avaliador,
	deleteAmostra,
	fetchAmostra,
	fetchAvaliadores,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatValue(field: TextField, value: string | number): string {
	if (value == null || value === "") return "—";
	if (moneyFields.has(field)) return brl.format(Number(value));
	if (areaFields.has(field)) return `${value} m²`;
	if (meterFields.has(field)) return `${value} m`;
	return String(value) || "—";
}

function DetailItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
			<p className="text-sm text-slate-100">{value}</p>
		</div>
	);
}

function SectionGrid({ children }: { children: React.ReactNode }) {
	return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
	return (
		<div className="border-b border-white/10 pb-2">
			<h3 className="text-base font-semibold text-slate-200">{title}</h3>
			{description && <p className="text-xs text-slate-500">{description}</p>}
		</div>
	);
}

function AmostraSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<SectionHeader title={title} description={description} />
			{children}
		</div>
	);
}

export function AmostraDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const amostraId = Number(id);
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const {
		data: amostra,
		isLoading,
		error,
	} = useQuery<Amostra, Error>({
		queryKey: ["amostra", amostraId],
		queryFn: () => fetchAmostra(amostraId),
		enabled: !Number.isNaN(amostraId),
	});

	const { data: avaliadores } = useQuery<Avaliador[]>({
		queryKey: ["avaliadores"],
		queryFn: fetchAvaliadores,
	});

	const avaliador = avaliadores?.find((a) => a.id === amostra?.avaliadorId);

	const deleteMutation = useMutation({
		mutationFn: () => deleteAmostra(amostraId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["amostras"] });
			navigate("/amostras");
		},
	});

	if (isLoading) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<div className="flex items-center justify-center py-20 text-slate-400">
					<LoaderCircleIcon className="animate-spin mr-3" />
					Carregando amostra...
				</div>
			</Layout>
		);
	}

	if (error || !amostra) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<Alert variant="destructive" className="border-red-900 bg-red-950/40">
					<AlertDescription className="text-red-300">
						{error?.message ?? "Amostra não encontrada."}
					</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	const telefoneFormatted =
		amostra.ddd && amostra.telefone ? `(${amostra.ddd}) ${amostra.telefone}` : "—";

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
								{[amostra.endereco, amostra.municipio, amostra.uf]
									.filter(Boolean)
									.join(", ") || `Amostra #${amostra.id}`}
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
							<AlertDialog.Root>
								<AlertDialog.Trigger
									render={
										<button
											type="button"
											className={cn(
												buttonVariants({ variant: "ghost", size: "icon-sm" }),
												"text-red-400 hover:bg-red-950/60 hover:text-red-300",
											)}
											title="Deletar amostra"
										>
											<Trash2Icon />
										</button>
									}
								/>
								<AlertDialog.Portal>
									<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
									<AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-black/50">
										<AlertDialog.Title className="text-base font-semibold text-slate-100">
											Deletar amostra?
										</AlertDialog.Title>
										<AlertDialog.Description className="mt-2 text-sm text-slate-400">
											Essa ação não pode ser desfeita. A amostra será permanentemente removida.
										</AlertDialog.Description>
										<div className="mt-5 flex justify-end gap-3">
											<AlertDialog.Close
												render={
													<button
														type="button"
														className="rounded-md px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
													>
														Cancelar
													</button>
												}
											/>
											<AlertDialog.Close
												render={
													<button
														type="button"
														className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
														disabled={deleteMutation.isLoading}
														onClick={() => deleteMutation.mutate()}
													>
														{deleteMutation.isLoading ? "Deletando..." : "Deletar"}
													</button>
												}
											/>
										</div>
									</AlertDialog.Popup>
								</AlertDialog.Portal>
							</AlertDialog.Root>
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
											label={fieldLabels[field]}
											value={formatValue(field, amostra[field as keyof Amostra] as string | number)}
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
													{amostra.incidencias[i] != null ? `${amostra.incidencias[i]}%` : "—"}
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
								{amostra.acumuladoProposto.length > 0 ? (
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
													<td className="py-1.5 text-right tabular-nums text-slate-100">{v}%</td>
												</tr>
											))}
										</tbody>
									</table>
								) : (
									<p className="text-sm text-slate-500">—</p>
								)}
							</div>
						</div>
					</AmostraSection>
				</CardContent>
			</Card>
		</Layout>
	);
}
