import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

// Check document class for theme (works with next-themes, etc.)
function getDocumentTheme(): Theme | null {
	if (typeof document === "undefined") return null;
	if (document.documentElement.classList.contains("dark")) return "dark";
	if (document.documentElement.classList.contains("light")) return "light";
	return null;
}

// Get system preference
function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useResolvedTheme(themeProp?: "light" | "dark"): Theme {
	const [detectedTheme, setDetectedTheme] = useState<Theme>(
		() => getDocumentTheme() ?? getSystemTheme(),
	);

	useEffect(() => {
		if (themeProp) return; // Skip detection if theme is provided via prop

		// Re-sync immediately in case the theme changed while detection was paused
		setDetectedTheme(getDocumentTheme() ?? getSystemTheme());

		// Watch for document class changes (e.g., next-themes toggling dark class)
		const observer = new MutationObserver(() => {
			const docTheme = getDocumentTheme();
			if (docTheme) {
				setDetectedTheme(docTheme);
			}
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		// Also watch for system preference changes
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleSystemChange = (e: MediaQueryListEvent) => {
			// Only use system preference if no document class is set
			if (!getDocumentTheme()) {
				setDetectedTheme(e.matches ? "dark" : "light");
			}
		};
		mediaQuery.addEventListener("change", handleSystemChange);

		return () => {
			observer.disconnect();
			mediaQuery.removeEventListener("change", handleSystemChange);
		};
	}, [themeProp]);

	return themeProp ?? detectedTheme;
}
