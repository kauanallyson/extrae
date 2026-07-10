import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AmostraDetailsPage } from "./pages/AmostraDetailsPage";
import { AmostraSimilaresPage } from "./pages/AmostraSimilaresPage";
import { AmostrasPage } from "./pages/AmostrasPage";
import { AvaliadorPage } from "./pages/AvaliadorPage";
import { EditAmostraPage } from "./pages/EditAmostraPage";
import { HomePage } from "./pages/HomePage";
import { NewAmostraPage } from "./pages/NewAmostraPage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
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
		path: "/amostras/similares",
		element: <AmostraSimilaresPage />,
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
		path: "/avaliadores",
		element: <AvaliadorPage />,
	},
]);

export function App() {
	return (
		<>
			<RouterProvider router={router} />
			<Toaster />
		</>
	);
}
