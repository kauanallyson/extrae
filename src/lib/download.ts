import type { DownloadResult } from "@/lib/api";

export function triggerDownload({ blobUrl, filename }: DownloadResult) {
	const a = document.createElement("a");
	a.href = blobUrl;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(blobUrl);
}
