import { useMutation } from "@tanstack/react-query";
import { LoaderCircleIcon, SearchIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	defaultValues,
	estadoConservacaoOptions,
	padraoAcabamentoOptions,
	parseSimilaresForm,
	type SimilaresFormValues,
	similaresFormResolver,
} from "@/features/similares/fields";
import { type AmostraSimilaresResult, ApiError, fetchAmostrasSimilares } from "@/lib/api";
import { brl } from "@/lib/format";
import { fieldInputClassName, inputGroupClassName } from "@/lib/formStyles";
import { cn, getErrorMessage } from "@/lib/utils";
import { maskDataReferencia, maskDecimalDuasCasas, normalizeCoordenadaDms } from "@/lib/validators";

const selectTriggerClassName =
	"h-10 min-h-10 w-full rounded-md border-slate-600 bg-slate-800 px-2.5 py-1 text-slate-100 hover:text-white data-placeholder:text-slate-500 data-[size=default]:h-10 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 [&>svg]:text-slate-400";
const selectContentClassName = "dark border border-slate-600 bg-slate-800 text-slate-100";
const selectItemClassName = "focus:bg-slate-700 focus:text-slate-50";
const numberInputClassName =
	"[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function AmostraSimilaresPage() {
	const form = useForm<SimilaresFormValues>({
		defaultValues,
		resolver: similaresFormResolver,
	});

	const mutation = useMutation<AmostraSimilaresResult, ApiError | Error, SimilaresFormValues>({
		mutationFn: async (values) => {
			const { criterios, options } = parseSimilaresForm(values);
			return fetchAmostrasSimilares(criterios, options);
		},
	});

	const invalidCoords = mutation.error instanceof ApiError && mutation.error.status === 422;

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="px-6 pt-6">
					<CardTitle className="text-3xl text-slate-50">Amostras similares</CardTitle>
					<CardDescription className="text-slate-400">
						Informe os dados de um imóvel hipotético para encontrar amostras parecidas e estimar seu
						valor.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-8 px-6 pb-6">
					<Form {...form}>
						<form
							className="space-y-6"
							onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
						>
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								<FormField
									control={form.control}
									name="coordenadaS"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Coordenada S</FormLabel>
											<Input
												{...field}
												placeholder={"05º39'05,497\""}
												aria-invalid={fieldState.invalid}
												onChange={(event) =>
													field.onChange(normalizeCoordenadaDms(event.target.value))
												}
												className={fieldInputClassName}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="coordenadaW"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Coordenada W</FormLabel>
											<Input
												{...field}
												placeholder={"40º31'12,209\""}
												aria-invalid={fieldState.invalid}
												onChange={(event) =>
													field.onChange(normalizeCoordenadaDms(event.target.value))
												}
												className={fieldInputClassName}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="dataReferencia"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Data de referência</FormLabel>
											<Input
												{...field}
												placeholder="DD/MM/AAAA"
												aria-invalid={fieldState.invalid}
												onChange={(event) => field.onChange(maskDataReferencia(event.target.value))}
												className={fieldInputClassName}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="areaTerreno"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Área do terreno</FormLabel>
											<InputGroup className={inputGroupClassName}>
												<InputGroupInput
													{...field}
													inputMode="decimal"
													placeholder="0,00"
													aria-invalid={fieldState.invalid}
													onChange={(event) =>
														field.onChange(maskDecimalDuasCasas(event.target.value))
													}
													className="text-slate-100 placeholder:text-slate-500"
												/>
												<InputGroupAddon align="inline-end">
													<InputGroupText className="text-slate-400">m²</InputGroupText>
												</InputGroupAddon>
											</InputGroup>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="areaConstruida"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Área construída</FormLabel>
											<InputGroup className={inputGroupClassName}>
												<InputGroupInput
													{...field}
													inputMode="decimal"
													placeholder="0,00"
													aria-invalid={fieldState.invalid}
													onChange={(event) =>
														field.onChange(maskDecimalDuasCasas(event.target.value))
													}
													className="text-slate-100 placeholder:text-slate-500"
												/>
												<InputGroupAddon align="inline-end">
													<InputGroupText className="text-slate-400">m²</InputGroupText>
												</InputGroupAddon>
											</InputGroup>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="padraoAcabamento"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Padrão de acabamento</FormLabel>
											<Select
												value={field.value || undefined}
												onValueChange={(value) => field.onChange(value ?? "")}
											>
												<SelectTrigger className={selectTriggerClassName}>
													<SelectValue placeholder="Não informado" />
												</SelectTrigger>
												<SelectContent
													alignItemWithTrigger={false}
													className={selectContentClassName}
												>
													{padraoAcabamentoOptions.map((opt) => (
														<SelectItem key={opt} value={opt} className={selectItemClassName}>
															{opt}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="estadoConservacao"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Estado de conservação</FormLabel>
											<Select
												value={field.value || undefined}
												onValueChange={(value) => field.onChange(value ?? "")}
											>
												<SelectTrigger className={selectTriggerClassName}>
													<SelectValue placeholder="Não informado" />
												</SelectTrigger>
												<SelectContent
													alignItemWithTrigger={false}
													className={selectContentClassName}
												>
													{estadoConservacaoOptions.map((opt) => (
														<SelectItem key={opt} value={opt} className={selectItemClassName}>
															{opt}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="raioKm"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Raio de busca</FormLabel>
											<InputGroup className={inputGroupClassName}>
												<InputGroupInput
													{...field}
													inputMode="decimal"
													aria-invalid={fieldState.invalid}
													className="text-slate-100 placeholder:text-slate-500"
												/>
												<InputGroupAddon align="inline-end">
													<InputGroupText className="text-slate-400">km</InputGroupText>
												</InputGroupAddon>
											</InputGroup>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="limit"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel className="text-slate-200">Máximo de similares</FormLabel>
											<Input
												{...field}
												type="number"
												min={1}
												inputMode="numeric"
												aria-invalid={fieldState.invalid}
												className={cn(fieldInputClassName, numberInputClassName)}
											/>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<Button type="submit" disabled={mutation.isPending} className="gap-1.5">
								{mutation.isPending ? (
									<LoaderCircleIcon className="h-3.5 w-3.5 animate-spin" />
								) : (
									<SearchIcon className="h-3.5 w-3.5" />
								)}
								Buscar similares
							</Button>
						</form>
					</Form>

					{mutation.isError && (
						<p className="text-sm text-red-400">
							{invalidCoords
								? "As coordenadas informadas não são válidas para calcular similares."
								: getErrorMessage(mutation.error)}
						</p>
					)}

					{mutation.isSuccess &&
						(mutation.data.similares.length === 0 ? (
							<p className="text-sm text-slate-500">Nenhuma amostra similar encontrada.</p>
						) : (
							<div className="space-y-4">
								{mutation.data.estimativa && (
									<div className="grid gap-4 sm:grid-cols-2">
										<div className="space-y-1">
											<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
												Estimativa valor do imóvel
											</p>
											<p className="text-lg font-semibold text-slate-100">
												{mutation.data.estimativa.valorImovel != null
													? brl.format(mutation.data.estimativa.valorImovel)
													: "—"}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
												Estimativa valor do terreno
											</p>
											<p className="text-lg font-semibold text-slate-100">
												{mutation.data.estimativa.valorTerreno != null
													? brl.format(mutation.data.estimativa.valorTerreno)
													: "—"}
											</p>
										</div>
									</div>
								)}
								<div className="overflow-x-auto p-2">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-white/10 text-left text-xs text-slate-500">
												<th className="pb-2 pl-3 pr-4 font-medium">Amostra</th>
												<th className="pb-2 pr-4 font-medium">Município/UF</th>
												<th className="pb-2 pr-4 text-right font-medium">Score</th>
												<th className="pb-2 pr-4 text-right font-medium">Distância</th>
												<th className="pb-2 pr-4 text-right font-medium">Valor imóvel</th>
												<th className="pb-2 pr-3 text-right font-medium">Valor terreno</th>
											</tr>
										</thead>
										<tbody>
											{mutation.data.similares.map(({ amostra, score, distanciaKm }) => (
												<tr key={amostra.id} className="border-b border-white/5 last:border-0">
													<td className="rounded-l-lg py-3 pl-3 pr-4 font-medium text-slate-100">
														<Link to={`/amostras/${amostra.id}`} className="hover:underline">
															{amostra.proponente || `Amostra #${amostra.id}`}
														</Link>
													</td>
													<td className="py-3 pr-4 text-slate-300">
														{amostra.municipio
															? `${amostra.municipio}${amostra.uf ? `/${amostra.uf}` : ""}`
															: "—"}
													</td>
													<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
														{Math.round(score * 100)}%
													</td>
													<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
														{distanciaKm.toFixed(2)} km
													</td>
													<td className="py-3 pr-4 text-right tabular-nums text-slate-100">
														{amostra.valorImovel != null ? brl.format(amostra.valorImovel) : "—"}
													</td>
													<td className="rounded-r-lg py-3 pr-3 text-right tabular-nums text-slate-100">
														{amostra.valorTerreno != null ? brl.format(amostra.valorTerreno) : "—"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						))}
				</CardContent>
			</Card>
		</Layout>
	);
}
