import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Animation } from "./Animation.tsx";
import { SunSpotter } from "./SunSpotter.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SunSpotter />,
  },
  {
    path: "/print",
    element: <SunSpotter />,
  },
  {
    path: "/animation",
    element: <Animation />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
