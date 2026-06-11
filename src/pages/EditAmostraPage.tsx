import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeftIcon, LoaderCircleIcon, Trash2Icon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { Layout } from "@/components/Layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AmostraForm } from "@/features/amostras/AmostraForm";
import { AmostraFormFooter } from "@/features/amostras/AmostraFormFooter";
import { type AmostraFormValues, defaultValues } from "@/features/amostras/fields";
import { amostraFormResolver } from "@/features/amostras/schema";
import { amostraToFormValues } from "@/features/amostras/transforms";
import { useGerarRaePreference, useSaveAmostra } from "@/features/amostras/useSaveAmostra";
import { type Amostra, deleteAmostra, fetchAmostra, updateAmostra } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { cn, getErrorMessage } from "@/lib/utils";

export function EditAmostraPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const amostraId = Number(id);
	const queryClient = useQueryClient();

	const {
		data: amostra,
		isLoading,
		error: loadError,
	} = useQuery<Amostra, Error>({
		queryKey: queryKeys.amostra(amostraId),
		queryFn: () => fetchAmostra(amostraId),
		enabled: !Number.isNaN(amostraId),
	});

	const form = useForm<AmostraFormValues>({
		defaultValues,
		resolver: amostraFormResolver,
	});

	useEffect(() => {
		if (amostra) form.reset(amostraToFormValues(amostra));
	}, [amostra, form]);

	const [gerarRae, setGerarRae] = useGerarRaePreference("editar-amostra-gerar-rae");

	const saveMutation = useSaveAmostra((input) => updateAmostra(amostraId, input));
	const isSubmitting = saveMutation.isPending;
	const downloadData = saveMutation.data?.download;

	const deleteMutation = useMutation({
		mutationFn: () => deleteAmostra(amostraId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.amostras() });
			navigate("/amostras");
		},
	});

	if (isLoading) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<div className="flex items-center justify-center py-20 text-slate-400">
					<LoaderCircleIcon className="animate-spin mr-3" />
					Carregando amostra...
				</div>
			</Layout>
		);
	}

	if (loadError || Number.isNaN(amostraId)) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<Alert variant="destructive" className="border-red-900 bg-red-950/40">
					<AlertDescription className="text-red-300">
						{loadError ? getErrorMessage(loadError) : "ID de amostra inválido."}
					</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	if (!isLoading && !amostra) {
		return (
			<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
				<Alert variant="destructive" className="border-red-900 bg-red-950/40">
					<AlertDescription className="text-red-300">Amostra não encontrada.</AlertDescription>
				</Alert>
			</Layout>
		);
	}

	return (
		<Layout contentClassName="block max-w-6xl py-8 sm:py-10">
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate("/amostras")}
				className="mb-4 -ml-2 text-slate-400 hover:text-slate-100"
			>
				<ArrowLeftIcon className="h-4 w-4" />
				Voltar
			</Button>
			<Card className="border-white/10 bg-slate-900 text-slate-100 shadow-2xl shadow-black/30">
				<CardHeader className="px-6 pt-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<CardTitle className="text-3xl text-slate-50">Revisar Amostra #{amostraId}</CardTitle>
							<CardDescription className="text-slate-400">
								Verifique e corrija os dados extraídos pelo sistema antes de salvar.
							</CardDescription>
						</div>
						<ConfirmDeleteDialog
							trigger={
								<button
									type="button"
									className={cn(
										buttonVariants({ variant: "ghost", size: "icon-sm" }),
										"text-red-400 hover:bg-red-950/60 hover:text-red-300",
									)}
									title="Deletar amostra"
								>
									<Trash2Icon />
								</button>
							}
							title="Deletar amostra?"
							description="Essa ação não pode ser desfeita. A amostra será permanentemente removida."
							pending={deleteMutation.isPending}
							onConfirm={() => deleteMutation.mutate()}
						/>
					</div>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<AmostraForm
						form={form}
						isSubmitting={isSubmitting}
						onSubmit={(values) => saveMutation.mutate({ values, gerarRae })}
						footer={
							<AmostraFormFooter
								checkboxId="gerar-rae"
								gerarRae={gerarRae}
								onGerarRaeChange={setGerarRae}
								isSubmitting={isSubmitting}
								resetLabel="Restaurar"
								resetDisabled={isSubmitting}
								onReset={() => {
									if (amostra) form.reset(amostraToFormValues(amostra));
									saveMutation.reset();
								}}
							/>
						}
					/>

					{saveMutation.error && (
						<Alert variant="destructive" className="mt-6 border-red-900 bg-red-950/40">
							<AlertDescription className="text-red-300">
								{getErrorMessage(saveMutation.error)}
							</AlertDescription>
						</Alert>
					)}

					{saveMutation.isSuccess && (
						<Alert className="mt-6 border-emerald-900 bg-emerald-950/40 text-emerald-300">
							<AlertDescription className="text-emerald-300">
								{downloadData
									? "Amostra salva e planilha RAE baixada com sucesso."
									: "Amostra salva com sucesso."}
							</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</Layout>
	);
}
