import type { DownloadFile } from "@/lib/api";

// Cria a URL do blob, dispara o download e revoga a URL no mesmo lugar.
export function saveFile({ blob, filename }: DownloadFile) {
	const blobUrl = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = blobUrl;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(blobUrl);
}
