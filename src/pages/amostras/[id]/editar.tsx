import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AmostraForm } from "@/components/amostras/AmostraForm";
import { DeleteAmostraDialog } from "@/components/amostras/DeleteAmostraDialog";
import { Layout } from "@/components/layout/Layout";
import { PageLoading } from "@/components/shared/PageLoading";
import { PageMessage } from "@/components/shared/PageMessage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type AmostraFormValues, defaultValues } from "@/features/amostras/fields";
import { amostraFormResolver } from "@/features/amostras/schema";
import { amostraToFormValues } from "@/features/amostras/transforms";
import { useSaveAmostra } from "@/features/amostras/useSaveAmostra";
import { type Amostra, fetchAmostra, updateAmostra } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/utils";

export function EditAmostraPage() {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const amostraId = Number(id);

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

	useEffect(() => {
		if (loadError) toast.error(getErrorMessage(loadError));
	}, [loadError]);

	const save = useSaveAmostra((input) => updateAmostra(amostraId, input));

	if (isLoading) return <PageLoading label="Carregando amostra..." />;
	if (Number.isNaN(amostraId)) return <PageMessage>ID de amostra inválido.</PageMessage>;
	if (loadError) return <PageMessage>Erro ao carregar amostra.</PageMessage>;
	if (!amostra) return <PageMessage>Amostra não encontrada.</PageMessage>;

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
						<DeleteAmostraDialog amostraId={amostraId} />
					</div>
				</CardHeader>

				<CardContent className="px-6 pb-6">
					<AmostraForm
						form={form}
						save={save}
						resetLabel="Restaurar"
						onReset={() => {
							if (amostra) form.reset(amostraToFormValues(amostra));
						}}
					/>
				</CardContent>
			</Card>
		</Layout>
	);
}
