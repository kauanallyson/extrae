import { Layout } from "./components/Layout";
import { Link } from "./components/Link";
import { FileDropZone } from "./components/FileDropZone";
import { Checkbox } from "./components/Checkbox";
import { Button } from "./components/Button";

function App() {
  return (
    <Layout>
      <div className="flex flex-col gap-5 w-full max-w-2xl px-6">
        <h1 className="text-4xl font-bold tracking-tight">Extrator de Laudo</h1>

        <Link
          href="https://1drv.ms/f/c/40a54d6a68848790/IgAaP85iAmmPSIRXsZ_jaj5UAeXMSLfuK1cENOFMnGLRaqw?e=2aJxm0"
          text="Acessar Planilha RAE Atualizada"
        />

        <FileDropZone
          label="Arraste e solte os laudos aqui:"
          hint="Limite de 50MB por PDF."
          browseText="Browse files"
        />

        <Checkbox
          label="Gerar arquivo DADOS_IA para preencher a RAE?"
          defaultChecked
        />

        <div>
          <Button>Iniciar Processamento</Button>
        </div>
      </div>
    </Layout>
  );
}

export default App;
