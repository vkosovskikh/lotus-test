import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App/App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import TradePage from "./pages/TradePage/TradePage.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import RegisterPage from "./pages/RegisterPage/RegisterPage.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.tsx";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <TradePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/login/:token",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <div>Not found</div>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
