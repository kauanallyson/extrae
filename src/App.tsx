import { useMutation, useQuery } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { FileDropZone } from "./components/FileDropZone";
import { Layout } from "./components/Layout";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./components/ui/card";
import {
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./components/ui/select";
import {
	type Avaliador,
	type DownloadResult,
	downloadExcelRae,
	extrairTextoPdf,
	fetchAvaliadores,
	gerarAmostraIa,
} from "./lib/api";

type FormValues = {
	avaliadorId: string;
	pdf: FileList | null;
};

export function App() {
	const downloadRef = useRef<HTMLAnchorElement>(null);

	const {
		data: avaliadores,
		isLoading: avaliadoresLoading,
		isError: avaliadoresIsError,
	} = useQuery<Avaliador[]>({
		queryKey: ["avaliadores"],
		queryFn: fetchAvaliadores,
	});

	const form = useForm<FormValues>({
		defaultValues: { avaliadorId: "", pdf: null },
	});

	const selectedFile = form.watch("pdf");
	const getAvaliadorNome = (avaliadorId: string) =>
		avaliadores?.find((avaliador) => String(avaliador.id) === avaliadorId)
			?.nome;

	const pipeline = useMutation<DownloadResult, Error, FormValues>({
		mutationFn: async (values: FormValues) => {
			const pdf = values.pdf?.[0];
			if (!pdf) throw new Error("Nenhum arquivo PDF selecionado.");
			const avaliadorId = Number(values.avaliadorId);

			const amostraText = await extrairTextoPdf(pdf);
			const amostraId = await gerarAmostraIa(avaliadorId, amostraText);
			return await downloadExcelRae(amostraId);
		},
	});

	useEffect(() => {
		if (!pipeline.data) return;
		downloadRef.current?.click();
		return () => URL.revokeObjectURL(pipeline.data.blobUrl);
	}, [pipeline.data]);

	const isRunning = pipeline.isPending;
	const isDone = pipeline.isSuccess;

	return (
		<Layout>
			<Card className="w-full max-w-2xl border-white/10 bg-slate-900 px-6 py-8 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur">
				<CardHeader>
					<CardTitle className="text-4xl text-slate-50">
						Extrator de Amostra
					</CardTitle>
					<CardDescription className="text-slate-400">
						Faça upload do PDF e baixe a planilha para preenchimento da RAE.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-6">
					<a
						href="https://1drv.ms/x/c/40a54d6a68848790/IQC52jTKXpb4TLBBP3KGlrzzASOTalHY8GjPdigS9q06MUk"
						className="mb-4 block w-fit text-blue-500 underline hover:text-blue-700"
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
									validate: (value) =>
										value?.[0] ? true : "Selecione um arquivo PDF.",
								}}
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel htmlFor="pdf-upload">Laudo em PDF</FormLabel>
										<FileDropZone
											id="pdf-upload"
											hint="Upload de arquivo"
											browseText="Arraste e solte o laudo aqui"
											multiple={false}
											selectedFileName={selectedFile?.[0]?.name}
											ariaDescribedBy={
												fieldState.invalid ? "pdf-message" : "pdf-description"
											}
											ariaInvalid={fieldState.invalid}
											onChange={(files) =>
												field.onChange(files as FileList | null)
											}
										/>
										<FormDescription id="pdf-description">
											Exceto laudos A413
										</FormDescription>
										<FormMessage id="pdf-message" />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="avaliadorId"
								rules={{ required: "Selecione um avaliador." }}
								render={({ field, fieldState }) => (
									<FormItem>
										<FormLabel htmlFor="avaliador-trigger">Avaliador</FormLabel>
										<Select
											value={field.value || undefined}
											disabled={avaliadoresLoading || isRunning}
											onValueChange={(value) => field.onChange(value ?? "")}
										>
											<SelectTrigger
												id="avaliador-trigger"
												className="h-10 w-full rounded-md border-slate-700 bg-slate-900 text-slate-100 dark:border-slate-700 dark:bg-slate-900"
												aria-invalid={fieldState.invalid}
											>
												<SelectValue
													placeholder={
														avaliadoresLoading
															? "Carregando…"
															: avaliadoresIsError
																? "Erro ao carregar"
																: "Selecione um avaliador"
													}
												>
													{field.value ? getAvaliadorNome(field.value) : null}
												</SelectValue>
											</SelectTrigger>
											<SelectContent className="bg-slate-900 text-slate-100">
												{avaliadores?.map((p) => (
													<SelectItem key={p.id} value={String(p.id)}>
														{p.nome}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
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
										Processando…
									</>
								) : (
									"Iniciar Processamento"
								)}
							</Button>
						</form>
					</Form>

					{pipeline.error && (
						<Alert
							variant="destructive"
							className="border-red-900 bg-red-950/40"
						>
							<AlertDescription className="text-red-300">
								{pipeline.error.message}
							</AlertDescription>
						</Alert>
					)}
					{isDone && (
						<Alert className="border-emerald-900 bg-emerald-950/40 text-emerald-300">
							<AlertDescription className="text-emerald-300">
								Concluído! O download do Excel foi iniciado automaticamente.
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
