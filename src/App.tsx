import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/AuthContext";
import { HomePage } from "./pages";
import { AmostrasPage } from "./pages/amostras";
import { AmostraDetailsPage } from "./pages/amostras/[id]";
import { EditAmostraPage } from "./pages/amostras/[id]/editar";
import { AvaliadorPage } from "./pages/avaliadores";
import { EstatisticasPage } from "./pages/estatisticas";
import { LoginPage } from "./pages/login";
import { NewAmostraPage } from "./pages/nova-amostra";

const router = createBrowserRouter([
	{
		element: (
			<AuthProvider>
				<Outlet />
			</AuthProvider>
		),
		children: [
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
						path: "/estatisticas",
						element: <EstatisticasPage />,
					},
					{
						path: "/avaliadores",
						element: <AvaliadorPage />,
					},
				],
			},
		],
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
