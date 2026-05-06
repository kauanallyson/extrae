import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ExtrairAmostraPage } from "./pages/ExtrairAmostraPage";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
	},
	{
		path: "/extrair-amostra",
		element: <ExtrairAmostraPage />,
	},
	{
		path: "/mapa",
		element: <MapPage />,
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
