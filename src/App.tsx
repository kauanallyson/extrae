import { useState } from "react";
import { Layout } from "./components/Layout";
import { Link } from "./components/Link";
import { FileDropZone } from "./components/FileDropZone";
import { Checkbox } from "./components/Checkbox";
import { Button } from "./components/Button";
import { Input } from "./components/Input";
import { usePdf2Text } from "./hooks/usePdf2Text";
import { extractLaudoData } from "./hooks/extractLaudoData";
import { generateWorkbook } from "./hooks/useWorkbook";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { results, isLoading, extractFromFiles } = usePdf2Text();

  const handleProcess = async () => {
    if (isProcessing || isLoading) return;
    if (!apiKey) return setError("Insira a chave API do Gemini.");
    if (results.length === 0) return setError("Carregue ao menos um PDF.");

    setError(null);
    setIsProcessing(true);

    try {
      for (let i = 0; i < results.length; i++) {
        setProgress(`Processando ${i + 1} de ${results.length}...`);
        const result = results[i];
        const dados = await extractLaudoData(apiKey, result.text);
        console.log(`[${result.filename}]`, dados);
        await generateWorkbook(dados);
      }
      setProgress("Processamento concluído com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro desconhecido.";
      console.error(err);
      setError("Ocorreu um erro: " + message);
      setProgress(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const isBusy = isProcessing || isLoading;

  return (
    <Layout>
      <div className="flex flex-col gap-5 w-full max-w-2xl px-6">
        <h1 className="text-4xl font-bold tracking-tight">Extrator de Laudo</h1>

        <Link href="https://1drv.ms/f/c/40a54d6a68848790/IgAaP85iAmmPSIRXsZ_jaj5UAeXMSLfuK1cENOFMnGLRaqw?e=2aJxm0">
          Acessar Planilha RAE Atualizada
        </Link>

        <FileDropZone
          label="Arraste e solte os laudos aqui:"
          hint="Limite de 50MB por PDF."
          browseText="Upload de arquivos"
          onChange={(files) => {
            if (files && files.length > 0) {
              setError(null);
              setProgress(null);
              extractFromFiles(Array.from(files));
            }
          }}
        />

        <Checkbox
          label="Gerar arquivo DADOS_IA para preencher a RAE?"
          defaultChecked
        />

        <Input
          label="Chave API do GEMINI"
          placeholder="Chave secreta aqui"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <Button onClick={handleProcess} disabled={isBusy}>
          {isProcessing ? "Processando..." : "Iniciar Processamento"}
        </Button>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {progress && (
          <p
            className={`text-sm ${isProcessing ? "text-slate-400 animate-pulse" : "text-green-400"}`}
          >
            {progress}
          </p>
        )}
      </div>
    </Layout>
  );
}

export default App;
