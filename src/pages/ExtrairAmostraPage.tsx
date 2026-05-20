import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { AvaliadorSelectField } from "@/components/AvaliadorSelectField";
import { FileDropZone } from "../components/FileDropZone";
import { Layout } from "../components/Layout";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import {
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/form";
import { type DownloadResult, downloadExcelRae, extrairTextoPdf, gerarAmostraIa } from "../lib/api";

type FormValues = {
	avaliadorId: string;
	gerarRae: boolean;
	pdf: FileList | null;
};

const GERAR_RAE_STORAGE_KEY = "extrair-amostra-gerar-rae";

function getStoredGerarRae() {
	if (typeof window === "undefined") return true;
	return window.localStorage.getItem(GERAR_RAE_STORAGE_KEY) !== "false";
}

export function ExtrairAmostraPage() {
	const downloadRef = useRef<HTMLAnchorElement>(null);

	const form = useForm<FormValues>({
		defaultValues: {
			avaliadorId: "",
			gerarRae: getStoredGerarRae(),
			pdf: null,
		},
	});

	const selectedFile = form.watch("pdf");

	const pipeline = useMutation<DownloadResult | null, Error, FormValues>({
		mutationFn: async (values: FormValues) => {
			const pdf = values.pdf?.[0];
			if (!pdf) throw new Error("Nenhum arquivo PDF selecionado.");
			const avaliadorId = Number(values.avaliadorId);

			const amostraText = await extrairTextoPdf(pdf);
			const amostraId = await gerarAmostraIa(avaliadorId, amostraText);
			if (!values.gerarRae) return null;
			return await downloadExcelRae(amostraId);
		},
	});

	useEffect(() => {
		const data = pipeline.data;
		if (!data) return;
		downloadRef.current?.click();
		return () => URL.revokeObjectURL(data.blobUrl);
	}, [pipeline.data]);

	const isRunning = pipeline.isPending;
	const isDone = pipeline.isSuccess;

	return (
		<Layout>
			<Card className="w-full max-w-2xl border-white/10 bg-slate-900 px-6 py-8 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur">
				<CardHeader>
					<CardTitle className="text-4xl text-slate-50">Extrator de Amostra</CardTitle>
					<CardDescription className="text-slate-400">
						Faça upload do PDF e baixe a planilha para preenchimento da RAE.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					<a
						href="https://1drv.ms/x/c/40a54d6a68848790/IQC52jTKXpb4TLBBP3KGlrzzASOTalHY8GjPdigS9q06MUk"
						className="mb-4 block w-fit text-slate-300 underline underline-offset-4 transition-colors hover:text-slate-50"
						target="_blank"
						rel="noopener"
					>
						Acessar Planilha RAE Atualizada e Automatizada
					</a>

					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((values) => pipeline.mutate(values))}
							className="space-y-5"
						>
							<FormField
								control={form.control}
								name="pdf"
								rules={{
									validate: (value) => (value?.[0] ? true : "Selecione um arquivo PDF."),
								}}
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel htmlFor="pdf-upload" className="text-slate-200">
											Laudo em PDF
										</FormLabel>
										<FileDropZone
											id="pdf-upload"
											hint="Upload de arquivo"
											browseText="Arraste e solte o laudo aqui"
											multiple={false}
											selectedFileName={selectedFile?.[0]?.name}
											ariaDescribedBy={fieldState.invalid ? "pdf-message" : "pdf-description"}
											ariaInvalid={fieldState.invalid}
											onChange={(files) => field.onChange(files as FileList | null)}
										/>
										<FormDescription id="pdf-description">Exceto laudos A413</FormDescription>
										<FormMessage id="pdf-message" />
									</FormItem>
								)}
							/>

							<AvaliadorSelectField
								control={form.control}
								name="avaliadorId"
								disabled={isRunning}
							/>

							<FormField
								control={form.control}
								name="gerarRae"
								render={({ field }) => (
									<FormItem className="flex items-center gap-3 space-y-0 rounded-md border border-slate-600 bg-slate-800 px-3 py-3">
										<Checkbox
											id="gerar-rae"
											checked={field.value}
											disabled={isRunning}
											onCheckedChange={(checked) => {
												field.onChange(checked);
												window.localStorage.setItem(GERAR_RAE_STORAGE_KEY, String(checked));
											}}
											className="border-slate-500 bg-slate-700 text-slate-900 data-checked:border-slate-100 data-checked:bg-slate-100"
										/>
										<FormLabel htmlFor="gerar-rae" className="text-slate-100">
											Incluir geração de RAE
										</FormLabel>
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={isRunning}
								className="h-10 w-full rounded-md bg-slate-100 text-slate-900 hover:bg-slate-200"
							>
								{isRunning ? (
									<>
										<LoaderCircleIcon className="animate-spin" />
										Processando...
									</>
								) : (
									"Iniciar Processamento"
								)}
							</Button>
						</form>
					</Form>

					{pipeline.error && (
						<Alert variant="destructive" className="border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">{pipeline.error.message}</AlertDescription>
						</Alert>
					)}
					{isDone && (
						<Alert className="border-emerald-900 bg-emerald-950/40 text-emerald-300">
							<AlertDescription className="text-emerald-300">
								{pipeline.data
									? "Concluído! O download do Excel foi iniciado automaticamente."
									: "Concluído! A amostra foi gerada."}
							</AlertDescription>
						</Alert>
					)}
					{pipeline.data && (
						<a
							ref={downloadRef}
							href={pipeline.data.blobUrl}
							download={pipeline.data.filename}
							className="hidden"
							tabIndex={-1}
						>
							Baixar {pipeline.data.filename}
						</a>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
