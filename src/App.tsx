import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthContext";
import { AmostraDetailsPage } from "./pages/AmostraDetailsPage";
import { AmostrasPage } from "./pages/AmostrasPage";
import { AvaliadorPage } from "./pages/AvaliadorPage";
import { EditAmostraPage } from "./pages/EditAmostraPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { NewAmostraPage } from "./pages/NewAmostraPage";

const router = createBrowserRouter([
	{
		path: "/login",
		element: <LoginPage />,
	},
	{
		element: <RequireAuth />,
		children: [
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
		],
	},
]);

export function App() {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
			<Toaster />
		</AuthProvider>
	);
}
