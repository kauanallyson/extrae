import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AmostraDetailsPage } from "./pages/AmostraDetailsPage";
import { AmostrasPage } from "./pages/AmostrasPage";
import { EditAmostraPage } from "./pages/EditAmostraPage";
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
		path: "/amostras",
		element: <AmostrasPage />,
	},
	{
		path: "/amostras/:id",
		element: <AmostraDetailsPage />,
	},
	{
		path: "/amostras/:id/editar",
		element: <EditAmostraPage />,
	},
	{
		path: "/mapa",
		element: <MapPage />,
	},
]);

export function App() {
	return <RouterProvider router={router} />;
}
