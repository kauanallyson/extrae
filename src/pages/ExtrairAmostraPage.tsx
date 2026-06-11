import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FileDropZone } from "@/components/FileDropZone";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Form,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { amostraToFormValues } from "@/features/amostras/transforms";
import { type CreateAmostraInput, gerarAmostraIa } from "@/lib/api";

type FormValues = {
	pdf: FileList | null;
};

export function ExtrairAmostraPage() {
	const navigate = useNavigate();

	const form = useForm<FormValues>({
		defaultValues: {
			pdf: null,
		},
	});

	const selectedFile = form.watch("pdf");

	const pipeline = useMutation<CreateAmostraInput, Error, FormValues>({
		mutationFn: async (values: FormValues) => {
			const pdf = values.pdf?.[0];
			if (!pdf) throw new Error("Nenhum arquivo PDF selecionado.");
			return gerarAmostraIa(pdf);
		},
		onSuccess: (amostraData) => {
			const formValues = amostraToFormValues(amostraData);
			navigate("/nova-amostra", { state: { formValues } });
		},
	});

	const isRunning = pipeline.isPending;

	return (
		<Layout>
			<Card className="w-full max-w-2xl border-white/10 bg-slate-900 px-6 py-8 text-slate-100 shadow-2xl shadow-black/30 backdrop-blur">
				<CardHeader>
					<CardTitle className="text-4xl text-slate-50">Extrator de Amostra</CardTitle>
					<CardDescription className="text-slate-400">
						Faça upload do PDF e você será redirecionado para a página de edição para preencher a
						RAE.
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
				</CardContent>
			</Card>
		</Layout>
	);
}
