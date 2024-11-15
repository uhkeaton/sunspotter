import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import "./index.css";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Animation } from "./Animation.tsx";
import { SunSpotter } from "./SunSpotter.tsx";
import { Home } from "./Home.tsx";
import { GlobalProvider } from "./useGlobal.tsx";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

// https://muffinman.io/blog/react-router-subfolder-on-server/

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HashRouter>
        <GlobalProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/print" element={<SunSpotter />} />
            <Route path="/animation" element={<Animation />} />
          </Routes>
        </GlobalProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
