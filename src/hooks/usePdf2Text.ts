import { useCallback, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export type PdfResult = {
  filename: string;
  text: string;
};

export function usePdf2Text() {
  const [results, setResults] = useState<PdfResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const extractFromFiles = useCallback(async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const extracted = await Promise.all(
        files.map(async (file) => {
          const data = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data }).promise;

          const pages = await Promise.all(
            Array.from({ length: pdf.numPages }, (_, i) =>
              pdf.getPage(i + 1).then((page) => page.getTextContent()),
            ),
          );

          const fullText = pages
            .map((content) =>
              content.items
                .filter((item): item is TextItem => "str" in item)
                .map((item) => item.str)
                .join(" "),
            )
            .join("\n");

          return { filename: file.name, text: fullText };
        }),
      );

      setResults(extracted);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar PDFs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, extractFromFiles };
}
