import { useForm } from "react-hook-form";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmostraForm } from "@/features/amostras/AmostraForm";
import { AmostraFormFooter } from "@/features/amostras/AmostraFormFooter";
import { type AmostraFormValues, defaultValues } from "@/features/amostras/fields";
import { PreencherComIaButton } from "@/features/amostras/PreencherComIaButton";
import { amostraFormResolver } from "@/features/amostras/schema";
import { useGerarRaePreference, useSaveAmostra } from "@/features/amostras/useSaveAmostra";
import { createAmostra } from "@/lib/api";

export function NewAmostraPage() {
	const form = useForm<AmostraFormValues>({
		defaultValues,
		resolver: amostraFormResolver,
	});

	const [gerarRae, setGerarRae] = useGerarRaePreference("nova-amostra-gerar-rae");

	const saveMutation = useSaveAmostra(createAmostra, {
		onSuccess: () => {
			form.reset(defaultValues);
		},
	});

	const { reset: resetMutation, isPending: isSubmitting } = saveMutation;

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
					<PreencherComIaButton disabled={isSubmitting} onFill={(values) => form.reset(values)} />
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
				</CardContent>
			</Card>
		</Layout>
	);
}
