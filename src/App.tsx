import { useState } from "react";
import { Layout } from "./components/Layout";
import { Link } from "./components/Link";
import { FileDropZone } from "./components/FileDropZone";
import { Checkbox } from "./components/Checkbox";
import { Button } from "./components/Button";
import { usePdf2Text } from "./hooks/usePdf2Text";
import { useGemini } from "./hooks/useGemini";
import { generateWorkbook } from "./hooks/useWorkbook";
import { Input } from "./components/Input";

function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { results, isLoading, extractFromFiles } = usePdf2Text();

  const handleProcess = async () => {
    if (!apiKey) return alert("Insira a chave API do Gemini.");
    if (results.length === 0) return alert("Carregue ao menos um PDF.");
    setIsProcessing(true);
    try {
      for (const result of results) {
        const dados = await useGemini(apiKey, result.text);
        console.log(`[${result.filename}]`, dados);
        await generateWorkbook(dados);
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
        <Button onClick={handleProcess} disabled={isProcessing || isLoading}>
          {isProcessing ? "Processando..." : "Iniciar Processamento"}
        </Button>
        {isProcessing && (
          <p className="text-slate-400 text-sm animate-pulse">
            Enviando para o Gemini, aguarde...
          </p>
        )}
      </div>
    </Layout>
  );
}

export default App;
