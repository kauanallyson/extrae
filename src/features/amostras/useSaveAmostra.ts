import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
	type Amostra,
	type CreateAmostraInput,
	type DownloadResult,
	downloadExcelRae,
} from "@/lib/api";
import { triggerDownload } from "@/lib/download";
import { getErrorMessage } from "@/lib/utils";
import type { AmostraFormValues } from "./fields";
import { parseFormValues } from "./transforms";

export function useGerarRaePreference(storageKey: string) {
	const [gerarRae, setGerarRaeState] = useState(() => {
		if (typeof window === "undefined") return true;
		return window.localStorage.getItem(storageKey) !== "false";
	});

	const setGerarRae = (value: boolean) => {
		setGerarRaeState(value);
		window.localStorage.setItem(storageKey, String(value));
	};

	return [gerarRae, setGerarRae] as const;
}

export type SaveAmostraResult = {
	amostra: Amostra;
	download?: DownloadResult;
	downloadError?: Error;
};

type SaveAmostraVariables = {
	values: AmostraFormValues;
	gerarRae: boolean;
};

export function useSaveAmostra(
	save: (input: CreateAmostraInput) => Promise<Amostra>,
	options?: { onSuccess?: (result: SaveAmostraResult) => void },
) {
	return useMutation<SaveAmostraResult, Error, SaveAmostraVariables>({
		mutationFn: async ({ values, gerarRae }) => {
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
			if (result.download) triggerDownload(result.download);
			if (result.downloadError) {
				toast.warning(`Amostra ${result.amostra.id} salva, mas o download da planilha RAE falhou.`);
			} else if (result.download) {
				toast.success("Amostra salva e planilha RAE baixada com sucesso.");
			} else {
				toast.success(`Amostra ${result.amostra.id} salva com sucesso.`);
			}
			options?.onSuccess?.(result);
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
}
