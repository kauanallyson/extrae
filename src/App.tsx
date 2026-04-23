import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "./components/Button";
import { FileDropZone } from "./components/FileDropZone";
import { Layout } from "./components/Layout";
import { Link } from "./components/Link";
import {
	type DownloadResult,
	downloadExcelRae,
	extrairTextoPdf,
	fetchProfissionais,
	gerarLaudoIa,
	type Profissional,
} from "./lib/api";

type FormValues = {
	profissionalId: string;
	pdf: FileList | null;
};

export function App() {
	const downloadRef = useRef<HTMLAnchorElement>(null);

	const {
		data: profissionais,
		isLoading: profissionaisLoading,
		isError: profissionaisIsError,
	} = useQuery<Profissional[]>({
		queryKey: ["profissionais"],
		queryFn: fetchProfissionais,
	});

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<FormValues>({
		defaultValues: { profissionalId: "", pdf: null },
	});

	const selectedFile = watch("pdf");

	const pipeline = useMutation<DownloadResult, Error, FormValues>({
		mutationFn: async (values: FormValues) => {
			const pdf = values.pdf?.[0];
			if (!pdf) throw new Error("Nenhum arquivo PDF selecionado.");
			const profissionalId = Number(values.profissionalId);

			const laudoText = await extrairTextoPdf(pdf);
			const laudoId = await gerarLaudoIa(profissionalId, laudoText);
			return await downloadExcelRae(laudoId);
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
			<div className="flex flex-col gap-6 w-full max-w-2xl px-6 py-10">
				<div className="flex flex-col gap-1">
					<h1 className="text-4xl font-bold tracking-tight">
						Extrator de Laudo
					</h1>
					<p className="text-sm text-slate-400">
						Faça upload do PDF, aguarde as 3 etapas e baixe a planilha RAE.
					</p>
				</div>

				<Link href="https://1drv.ms/x/c/40a54d6a68848790/IQC52jTKXpb4TLBBP3KGlrzzASOTalHY8GjPdigS9q06MUk">
					Acessar Planilha RAE Atualizada e Automatizada
				</Link>

				<form
					onSubmit={handleSubmit((values) => pipeline.mutate(values))}
					className="flex flex-col gap-5"
				>
					<FileDropZone
						label="Arraste e solte o laudo aqui:"
						hint="Exceto laudos A413"
						browseText="Upload de arquivo"
						multiple={false}
						onChange={(files) => setValue("pdf", files as unknown as FileList)}
					/>

					{selectedFile?.[0] && (
						<p className="text-xs text-slate-400 -mt-3">
							Arquivo selecionado:{" "}
							<span className="text-slate-200 font-medium">
								{selectedFile[0].name}
							</span>
						</p>
					)}

					{errors.pdf && (
						<p className="text-xs text-red-400">{errors.pdf.message}</p>
					)}

					<label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
						Profissional
						<select
							disabled={profissionaisLoading || isRunning}
							className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
							{...register("profissionalId", {
								required: "Selecione um profissional.",
							})}
						>
							<option value="" disabled>
								{profissionaisLoading
									? "Carregando…"
									: profissionaisIsError
										? "Erro ao carregar"
										: "Selecione um profissional"}
							</option>
							{profissionais?.map((p) => (
								<option key={p.id} value={String(p.id)}>
									{p.nome}
								</option>
							))}
						</select>
						{errors.profissionalId && (
							<p className="text-xs text-red-400">
								{errors.profissionalId.message}
							</p>
						)}
					</label>

					<Button type="submit" disabled={isRunning}>
						{isRunning ? "Processando…" : "Iniciar Processamento"}
					</Button>
				</form>

				{pipeline.error && (
					<p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded px-3 py-2">
						{pipeline.error.message}
					</p>
				)}
				{isDone && (
					<p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-800 rounded px-3 py-2">
						✓ Concluído! O download do Excel foi iniciado automaticamente.
					</p>
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
			</div>
		</Layout>
	);
}
