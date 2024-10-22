import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import "./index.css";

import {
  createHashRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { Animation } from "./Animation.tsx";
import { SunSpotter } from "./SunSpotter.tsx";
import { Home } from "./Home.tsx";

// https://muffinman.io/blog/react-router-subfolder-on-server/
const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/print",
    element: <SunSpotter />,
  },
  {
    path: "/animation",
    element: <Animation />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
