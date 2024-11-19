import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Animation } from "./Animation.tsx";
import { Print } from "./Print.tsx";
import { GlobalProvider } from "./useGlobal.tsx";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Nav,
  PATH_ANIMATION,
  PATH_CALCULATOR,
  PATH_OPTICS,
  PATH_PRINT,
} from "./Nav.tsx";
import { OpticsPage } from "./pages/OpticsPage.tsx";
import { Calculator } from "./pages/Calculator.tsx";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import "./Table.css";
// https://handsontable.com/docs/react-data-grid/installation/
import "handsontable/dist/handsontable.full.min.css";
import { registerAllModules } from "handsontable/registry";
registerAllModules();

// Create a client
const queryClient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// https://muffinman.io/blog/react-router-subfolder-on-server/

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <HashRouter>
          <GlobalProvider>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100vh",
              }}
            >
              <Nav />

              <Routes>
                <Route path="/" element={<Navigate to={PATH_ANIMATION} />} />
                <Route path="*" element={<Navigate to="/" />} />
                <Route path={PATH_PRINT} element={<Print />} />
                <Route path={PATH_ANIMATION} element={<Animation />} />
                <Route path={PATH_OPTICS} element={<OpticsPage />} />
                <Route path={PATH_CALCULATOR} element={<Calculator />} />
              </Routes>
            </div>
          </GlobalProvider>
        </HashRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
