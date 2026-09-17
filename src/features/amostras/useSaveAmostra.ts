import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	type Amostra,
	type CreateAmostraInput,
	type DownloadFile,
	deleteAmostra,
	downloadExcelRae,
} from "@/lib/api";
import { saveFile } from "@/lib/download";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/utils";
import type { AmostraFormValues } from "./fields";
import { parseFormValues } from "./transforms";

const GERAR_RAE_KEY = "amostra-gerar-rae";

// Uma preferência só, compartilhada entre criar e editar.
function useGerarRaePreference() {
	const [gerarRae, setGerarRaeState] = useState(
		() => window.localStorage.getItem(GERAR_RAE_KEY) !== "false",
	);

	const setGerarRae = (value: boolean) => {
		setGerarRaeState(value);
		window.localStorage.setItem(GERAR_RAE_KEY, String(value));
	};

	return [gerarRae, setGerarRae] as const;
}

// Tudo que depende de uma amostra: lista, detalhe, municípios (contagens) e estatísticas.
function useInvalidateAmostras() {
	const queryClient = useQueryClient();
	return (id?: number) => {
		queryClient.invalidateQueries({ queryKey: queryKeys.amostras() });
		queryClient.invalidateQueries({ queryKey: queryKeys.municipios });
		queryClient.invalidateQueries({ queryKey: queryKeys.stats() });
		if (id != null) queryClient.invalidateQueries({ queryKey: queryKeys.amostra(id) });
	};
}

type SaveAmostraResult = {
	amostra: Amostra;
	download?: DownloadFile;
	downloadError?: Error;
};

export type SaveAmostra = ReturnType<typeof useSaveAmostra>;

export function useSaveAmostra(
	save: (input: CreateAmostraInput) => Promise<Amostra>,
	options?: { onSuccess?: (amostra: Amostra) => void },
) {
	const invalidate = useInvalidateAmostras();
	const [gerarRae, setGerarRae] = useGerarRaePreference();

	const mutation = useMutation<SaveAmostraResult, Error, AmostraFormValues>({
		mutationFn: async (values) => {
			const amostra = await save(parseFormValues(values));
			if (!gerarRae) return { amostra };
			try {
				const download = await downloadExcelRae(amostra.id);
				return { amostra, download };
			} catch (err) {
				console.error("RAE download failed:", err);
				return {
					amostra,
					downloadError: err instanceof Error ? err : new Error(String(err)),
				};
			}
		},
		onSuccess: (result) => {
			invalidate(result.amostra.id);
			if (result.download) saveFile(result.download);
			if (result.downloadError) {
				toast.warning(`Amostra ${result.amostra.id} salva, mas o download da planilha RAE falhou.`);
			} else if (result.download) {
				toast.success("Amostra salva e planilha RAE baixada com sucesso.");
			} else {
				toast.success(`Amostra ${result.amostra.id} salva com sucesso.`);
			}
			options?.onSuccess?.(result.amostra);
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});

	return {
		submit: (values: AmostraFormValues) => mutation.mutate(values),
		isPending: mutation.isPending,
		reset: mutation.reset,
		gerarRae,
		setGerarRae,
	};
}

export function useDownloadRae() {
	return useMutation<DownloadFile, Error, number>({
		mutationFn: (amostraId) => downloadExcelRae(amostraId),
		onSuccess: (file) => {
			saveFile(file);
			toast.success("Planilha RAE baixada com sucesso.");
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}

export function useDeleteAmostra(amostraId: number) {
	const navigate = useNavigate();
	const invalidate = useInvalidateAmostras();
	return useMutation({
		mutationFn: () => deleteAmostra(amostraId),
		onSuccess: () => {
			invalidate(amostraId);
			navigate("/amostras");
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});
}
