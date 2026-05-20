import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ExtrairAmostraPage } from "./pages/ExtrairAmostraPage";
import { HomePage } from "./pages/HomePage";
import { MapPage } from "./pages/MapPage";
import { NewAmostraPage } from "./pages/NewAmostraPage";

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
		path: "/nova-amostra",
		element: <NewAmostraPage />,
	},
	{
		path: "/mapa",
		element: <MapPage />,
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
