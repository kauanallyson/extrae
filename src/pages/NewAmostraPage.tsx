import { useState } from "react";
import { useForm } from "react-hook-form";
import { AmostraForm } from "@/components/amostras/AmostraForm";
import { PreencherComIaButton } from "@/components/amostras/PreencherComIaButton";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AmostraFormValues, defaultValues } from "@/features/amostras/fields";
import { amostraFormResolver } from "@/features/amostras/schema";
import { useSaveAmostra } from "@/features/amostras/useSaveAmostra";
import { createAmostra } from "@/lib/api";

export function NewAmostraPage() {
	const form = useForm<AmostraFormValues>({
		defaultValues,
		resolver: amostraFormResolver,
	});

	const [camposNaoEncontrados, setCamposNaoEncontrados] = useState<Set<string>>(new Set());

	const save = useSaveAmostra(createAmostra, {
		onSuccess: () => {
			form.reset(defaultValues);
			setCamposNaoEncontrados(new Set());
		},
	});

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
						disabled={save.isPending}
						onFill={(values, campos) => {
							form.reset(values);
							setCamposNaoEncontrados(new Set(campos));
						}}
					/>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<AmostraForm
						form={form}
						save={save}
						camposNaoEncontrados={camposNaoEncontrados}
						resetLabel="Limpar"
						onReset={() => {
							form.reset(defaultValues);
							setCamposNaoEncontrados(new Set());
						}}
					/>
				</CardContent>
			</Card>
		</Layout>
	);
}
