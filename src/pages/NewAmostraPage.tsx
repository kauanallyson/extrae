import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmostraForm } from "@/features/amostras/AmostraForm";
import { AmostraFormFooter } from "@/features/amostras/AmostraFormFooter";
import { type AmostraFormValues, defaultValues } from "@/features/amostras/fields";
import { PreencherComIaButton } from "@/features/amostras/PreencherComIaButton";
import { amostraFormResolver } from "@/features/amostras/schema";
import { useGerarRaePreference, useSaveAmostra } from "@/features/amostras/useSaveAmostra";
import { createAmostra } from "@/lib/api";
import { cn, getErrorMessage } from "@/lib/utils";

export function NewAmostraPage() {
	const form = useForm<AmostraFormValues>({
		defaultValues,
		resolver: amostraFormResolver,
	});

	const [gerarRae, setGerarRae] = useGerarRaePreference("nova-amostra-gerar-rae");
	const [iaError, setIaError] = useState<string | null>(null);

	const saveMutation = useSaveAmostra(createAmostra, {
		onSuccess: () => form.reset(defaultValues),
	});

	const {
		error: saveError,
		data: saveResult,
		reset: resetMutation,
		isPending: isSubmitting,
	} = saveMutation;
	const createdAmostra = saveResult?.amostra;
	const downloadData = saveResult?.download;
	const downloadError = saveResult?.downloadError;

	useEffect(() => {
		if (!createdAmostra) return;
		const timeout = window.setTimeout(resetMutation, 5000);
		return () => window.clearTimeout(timeout);
	}, [createdAmostra, resetMutation]);

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="flex flex-col gap-4 px-6 pt-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-1.5">
						<CardTitle className="text-3xl text-slate-50">Nova Amostra</CardTitle>
						<CardDescription className="text-slate-400">
							Preencha os dados da amostra de imóvel para cadastro.
						</CardDescription>
					</div>
					<PreencherComIaButton
						disabled={isSubmitting}
						onStart={() => setIaError(null)}
						onFill={(values) => {
							setIaError(null);
							form.reset(values);
						}}
						onError={(message) => setIaError(message)}
					/>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<AmostraForm
						form={form}
						isSubmitting={isSubmitting}
						onSubmit={(values) => saveMutation.mutate({ values, gerarRae })}
						footer={
							<AmostraFormFooter
								checkboxId="gerar-rae-nova"
								gerarRae={gerarRae}
								onGerarRaeChange={setGerarRae}
								isSubmitting={isSubmitting}
								resetLabel="Limpar"
								onReset={() => {
									form.reset(defaultValues);
									resetMutation();
								}}
							/>
						}
					/>

					{iaError != null && (
						<Alert variant="destructive" className="mt-6 border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">{iaError}</AlertDescription>
						</Alert>
					)}

					{saveError != null && (
						<Alert variant="destructive" className="mt-6 border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">
								{getErrorMessage(saveError)}
							</AlertDescription>
						</Alert>
					)}

					{createdAmostra && (
						<Alert
							className={cn(
								"mt-6",
								downloadError
									? "border-amber-900 bg-amber-950/40 text-amber-300"
									: "border-emerald-900 bg-emerald-950/40 text-emerald-300",
							)}
						>
							<AlertDescription className={downloadError ? "text-amber-300" : "text-emerald-300"}>
								{downloadError
									? `Amostra ${createdAmostra.id} criada, mas o download da planilha RAE falhou.`
									: downloadData
										? "Amostra criada e planilha RAE baixada com sucesso."
										: `Amostra ${createdAmostra.id} criada com sucesso.`}
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
