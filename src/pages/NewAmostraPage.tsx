import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AmostraForm } from "@/features/amostras/AmostraForm";
import {
	type AmostraFormValues,
	amostraFormResolver,
	defaultValues,
	parseFormValues,
	secondaryButtonClassName,
} from "@/features/amostras/amostraFormSchema";
import { type Amostra, createAmostra, downloadExcelRae } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";

const GERAR_RAE_STORAGE_KEY = "nova-amostra-gerar-rae";

function getStoredGerarRae() {
	if (typeof window === "undefined") return true;
	return window.localStorage.getItem(GERAR_RAE_STORAGE_KEY) !== "false";
}

type CreateResult = {
	amostra: Amostra;
	download?: { blobUrl: string; filename: string };
};

export function NewAmostraPage() {
	const location = useLocation();
	const prefilled = (location.state as { formValues?: AmostraFormValues } | null)?.formValues;

	const form = useForm<AmostraFormValues>({
		defaultValues: prefilled ?? defaultValues,
		resolver: amostraFormResolver,
	});

	const [gerarRae, setGerarRae] = useState(getStoredGerarRae);
	const downloadRef = useRef<HTMLAnchorElement>(null);

	const createAmostraMutation = useMutation<CreateResult, unknown, { values: AmostraFormValues; gerarRae: boolean }>({
		mutationFn: async ({ values, gerarRae: shouldGenerate }) => {
			const parsed = parseFormValues(values);
			const amostra = await createAmostra(parsed);
			if (!shouldGenerate) return { amostra };
			try {
				const download = await downloadExcelRae(amostra.id);
				return { amostra, download };
			} catch (err) {
				console.error("RAE download failed:", err);
				return { amostra };
			}
		},
		onSuccess: () => form.reset(),
	});

	const isSubmitting = createAmostraMutation.isPending;
	const { error: createAmostraError, data: createResult, reset: resetMutation } = createAmostraMutation;
	const createdAmostra = createResult?.amostra;
	const downloadData = createResult?.download;

	useEffect(() => {
		if (!downloadData) return;
		downloadRef.current?.click();
		return () => URL.revokeObjectURL(downloadData.blobUrl);
	}, [downloadData]);

	useEffect(() => {
		if (!createdAmostra) return;
		const timeout = window.setTimeout(resetMutation, 5000);
		return () => window.clearTimeout(timeout);
	}, [createdAmostra, resetMutation]);

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="px-6 pt-6">
					<CardTitle className="text-3xl text-slate-50">Nova Amostra</CardTitle>
					<CardDescription className="text-slate-400">
						Preencha os dados da amostra de imóvel para cadastro.
					</CardDescription>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<AmostraForm
						form={form}
						isSubmitting={isSubmitting}
						onSubmit={(values) => createAmostraMutation.mutate({ values, gerarRae })}
						footer={
							<div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex items-center gap-3 rounded-md border border-slate-600 bg-slate-800 px-3 py-3">
									<Checkbox
										id="gerar-rae-nova"
										checked={gerarRae}
										disabled={isSubmitting}
										onCheckedChange={(checked) => {
											const val = checked === true;
											setGerarRae(val);
											window.localStorage.setItem(GERAR_RAE_STORAGE_KEY, String(val));
										}}
										className="border-slate-500 bg-slate-700 text-slate-900 data-checked:border-slate-100 data-checked:bg-slate-100"
									/>
									<label htmlFor="gerar-rae-nova" className="cursor-pointer text-sm text-slate-100">
										Gerar planilha RAE após salvar
									</label>
								</div>

								<div className="flex gap-3 sm:justify-end">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											form.reset();
											resetMutation();
										}}
										className={cn("h-10", secondaryButtonClassName)}
									>
										Limpar
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

					{createAmostraError != null && (
						<Alert variant="destructive" className="mt-6 border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">
								{getErrorMessage(createAmostraError)}
							</AlertDescription>
						</Alert>
					)}

					{createdAmostra && (
						<Alert className="mt-6 border-emerald-900 bg-emerald-950/40 text-emerald-300">
							<AlertDescription className="text-emerald-300">
								{downloadData
									? "Amostra criada e planilha RAE baixada com sucesso."
									: `Amostra ${createdAmostra.id} criada com sucesso.`}
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
