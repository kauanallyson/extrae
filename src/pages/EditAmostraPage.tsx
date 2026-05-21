import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AmostraForm } from "@/features/amostras/AmostraForm";
import {
	type AmostraFormValues,
	amostraFormResolver,
	amostraToFormValues,
	defaultValues,
	parseFormValues,
	secondaryButtonClassName,
} from "@/features/amostras/amostraFormSchema";
import {
	type Amostra,
	downloadExcelRae,
	fetchAmostra,
	updateAmostra,
} from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";

const GERAR_RAE_STORAGE_KEY = "editar-amostra-gerar-rae";

function getStoredGerarRae() {
	if (typeof window === "undefined") return true;
	return window.localStorage.getItem(GERAR_RAE_STORAGE_KEY) !== "false";
}

type UpdateResult = {
	amostra: Amostra;
	download?: { blobUrl: string; filename: string };
};

export function EditAmostraPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const amostraId = Number(id);
	const downloadRef = useRef<HTMLAnchorElement>(null);

	const { data: amostra, isLoading, error: loadError } = useQuery<Amostra, Error>({
		queryKey: ["amostra", amostraId],
		queryFn: () => fetchAmostra(amostraId),
		enabled: !Number.isNaN(amostraId),
	});

	const form = useForm<AmostraFormValues>({
		defaultValues,
		resolver: amostraFormResolver,
	});

	useEffect(() => {
		if (amostra) form.reset(amostraToFormValues(amostra));
	}, [amostra, form]);

	const [gerarRae, setGerarRae] = useState(getStoredGerarRae);

	const updateMutation = useMutation<UpdateResult, Error, { values: AmostraFormValues; gerarRae: boolean }>({
		mutationFn: async ({ values, gerarRae: shouldGenerate }) => {
			const parsed = parseFormValues(values);
			const updated = await updateAmostra(amostraId, parsed);
			if (!shouldGenerate) return { amostra: updated };
			try {
				const download = await downloadExcelRae(amostraId);
				return { amostra: updated, download };
			} catch (err) {
				console.error("RAE download failed:", err);
				return { amostra: updated };
			}
		},
	});

	const downloadData = updateMutation.data?.download;

	useEffect(() => {
		if (!downloadData) return;
		downloadRef.current?.click();
		return () => URL.revokeObjectURL(downloadData.blobUrl);
	}, [downloadData]);

	const isSubmitting = updateMutation.isPending;

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

	if (loadError || Number.isNaN(amostraId)) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<Alert variant="destructive" className="border-red-900 bg-red-950/40">
					<AlertDescription className="text-red-300">
						{loadError ? getErrorMessage(loadError) : "ID de amostra inválido."}
					</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	if (!isLoading && !amostra) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<Alert variant="destructive" className="border-red-900 bg-red-950/40">
					<AlertDescription className="text-red-300">Amostra não encontrada.</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate("/amostras")}
				className="mb-4 -ml-2 text-slate-400 hover:text-slate-100"
			>
				<ArrowLeftIcon className="h-4 w-4" />
				Voltar
			</Button>
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="px-6 pt-6">
					<CardTitle className="text-3xl text-slate-50">
						Revisar Amostra #{amostraId}
					</CardTitle>
					<CardDescription className="text-slate-400">
						Verifique e corrija os dados extraídos pelo sistema antes de salvar.
					</CardDescription>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<AmostraForm
						form={form}
						isSubmitting={isSubmitting}
						onSubmit={(values) => updateMutation.mutate({ values, gerarRae })}
						footer={
							<div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3 rounded-md border border-slate-600 bg-slate-800 px-3 py-3">
									<Checkbox
										id="gerar-rae"
										checked={gerarRae}
										disabled={isSubmitting}
										onCheckedChange={(checked) => {
											const val = checked === true;
											setGerarRae(val);
											window.localStorage.setItem(GERAR_RAE_STORAGE_KEY, String(val));
										}}
										className="border-slate-500 bg-slate-700 text-slate-900 data-checked:border-slate-100 data-checked:bg-slate-100"
									/>
									<label htmlFor="gerar-rae" className="cursor-pointer text-sm text-slate-100">
										Gerar planilha RAE após salvar
									</label>
								</div>

								<div className="flex gap-3 sm:justify-end">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											if (amostra) form.reset(amostraToFormValues(amostra));
											updateMutation.reset();
										}}
										disabled={isSubmitting}
										className={cn("h-10", secondaryButtonClassName)}
									>
										Restaurar
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
										className="h-10 bg-slate-100 text-slate-900 hover:bg-slate-200"
									>
										{isSubmitting ? (
											<>
												<LoaderCircleIcon className="animate-spin" />
												Salvando...
											</>
										) : (
											<>
												<CheckCircle2Icon />
												Salvar dados
											</>
										)}
									</Button>
								</div>
							</div>
						}
					/>

					{updateMutation.error && (
						<Alert variant="destructive" className="mt-6 border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">
								{getErrorMessage(updateMutation.error)}
							</AlertDescription>
						</Alert>
					)}

					{updateMutation.isSuccess && (
						<Alert className="mt-6 border-emerald-900 bg-emerald-950/40 text-emerald-300">
							<AlertDescription className="text-emerald-300">
								{downloadData
									? "Amostra salva e planilha RAE baixada com sucesso."
									: "Amostra salva com sucesso."}
							</AlertDescription>
						</Alert>
					)}

					{downloadData && (
						<a
							ref={downloadRef}
							href={downloadData.blobUrl}
							download={downloadData.filename}
							className="hidden"
							tabIndex={-1}
						>
							Baixar {downloadData.filename}
						</a>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
