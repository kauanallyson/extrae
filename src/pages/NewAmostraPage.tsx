import { useMutation } from "@tanstack/react-query";
import { CheckCircle2Icon, LoaderCircleIcon } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { AvaliadorSelectField } from "@/components/AvaliadorSelectField";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AmostraTextField } from "@/features/amostras/AmostraTextField";
import {
	type AmostraFormValues,
	amostraFormResolver,
	defaultValues,
	fieldGroups,
	fieldInputClassName,
	parseFormValues,
	secondaryButtonClassName,
} from "@/features/amostras/amostraFormSchema";
import { DecimalArrayField } from "@/features/amostras/DecimalArrayField";
import { FormSection } from "@/features/amostras/FormSection";
import { type Amostra, type CreateAmostraInput, createAmostra } from "@/lib/api";
import { cn } from "@/lib/utils";

type NewAmostraRequest = CreateAmostraInput;

export function NewAmostraPage() {
	const form = useForm<AmostraFormValues>({
		defaultValues,
		resolver: amostraFormResolver,
	});
	const incidencias = useFieldArray({
		control: form.control,
		name: "incidencias",
	});
	const acumuladoProposto = useFieldArray({
		control: form.control,
		name: "acumuladoProposto",
	});
	const createAmostraMutation = useMutation<Amostra, Error, NewAmostraRequest>({
		mutationFn: createAmostra,
	});

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="px-6 pt-6">
					<CardTitle className="text-3xl text-slate-50">Nova Amostra</CardTitle>
					<CardDescription className="text-slate-400">
						Preencha os dados da amostra. ID, criação e atualização são gerados pelo servidor.
					</CardDescription>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((values) =>
								createAmostraMutation.mutate(parseFormValues(values)),
							)}
							className="space-y-8"
						>
							<FormSection
								title="Responsável"
								description="Selecione o avaliador cadastrado e informe o contato da amostra."
							>
								<div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)]">
									<AvaliadorSelectField
										control={form.control}
										name="avaliadorId"
										disabled={createAmostraMutation.isPending}
									/>

									<FormField
										control={form.control}
										name="ddd"
										render={({ field, fieldState }) => (
											<FormItem>
												<FormLabel className="text-slate-200">DDD</FormLabel>
												<Input
													{...field}
													type="text"
													inputMode="numeric"
													maxLength={2}
													placeholder="00"
													aria-invalid={fieldState.invalid}
													className={cn(fieldInputClassName, "text-center")}
												/>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name="telefone"
										render={({ field, fieldState }) => (
											<FormItem>
												<FormLabel className="text-slate-200">Telefone</FormLabel>
												<Input
													{...field}
													type="text"
													inputMode="tel"
													placeholder="00000-0000"
													aria-invalid={fieldState.invalid}
													className={fieldInputClassName}
												/>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</FormSection>

							{fieldGroups.map((group) => (
								<FormSection key={group.title} title={group.title} description={group.description}>
									<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
										{group.fields.map((fieldName) => (
											<AmostraTextField
												key={fieldName}
												control={form.control}
												name={fieldName}
											/>
										))}
									</div>
								</FormSection>
							))}

							<FormSection
								title="Incidências e acumulados"
								description="Adicione cada valor com duas casas decimais para montar os arrays da requisição."
							>
								<div className="grid gap-6 lg:grid-cols-2">
									<DecimalArrayField
										control={form.control}
										name="incidencias"
										title="Incidências"
										fieldArray={incidencias}
									/>
									<DecimalArrayField
										control={form.control}
										name="acumuladoProposto"
										title="Acumulado proposto"
										fieldArray={acumuladoProposto}
									/>
								</div>
							</FormSection>

							<div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										form.reset();
										createAmostraMutation.reset();
									}}
									className={cn("h-10", secondaryButtonClassName)}
								>
									Limpar
								</Button>
								<Button
									type="submit"
									disabled={createAmostraMutation.isPending}
									className="h-10 bg-slate-100 text-slate-900 hover:bg-slate-200"
								>
									{createAmostraMutation.isPending ? (
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
						</form>
					</Form>

					{createAmostraMutation.error && (
						<Alert variant="destructive" className="mt-6 border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">
								{createAmostraMutation.error.message}
							</AlertDescription>
						</Alert>
					)}

					{createAmostraMutation.data && (
						<Alert className="mt-6 border-emerald-900 bg-emerald-950/40 text-emerald-300">
							<AlertDescription className="text-emerald-300">
								Amostra {createAmostraMutation.data.id} criada com sucesso.
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
