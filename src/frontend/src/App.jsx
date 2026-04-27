import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Layout from "./components/Layout";
import TutorialModal from "./components/TutorialModal";
import WelcomeOverlay from "./components/WelcomeOverlay";

import Home from "./pages/Home";
import IndicatorsComparisonPage from "./pages/IndicatorsComparisonPage";
import ComparisonPage from "./pages/ComparisonPage";
import MortgageSimulatorPage from "./pages/MortgageSimulatorPage";
import MethodologyPage from "./pages/MethodologyPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!welcomeOpen) return;

      if (event.key === "Escape") {
        setWelcomeOpen(false);
      }

      if (event.key === "Enter") {
        setWelcomeOpen(false);
        setTutorialOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [welcomeOpen]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route
          element={
            <Layout
              theme={theme}
              onToggleTheme={toggleTheme}
              onOpenHelp={() => setTutorialOpen(true)}
            />
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/indicators" element={<IndicatorsComparisonPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/simulator" element={<MortgageSimulatorPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Route>
      </Routes>

      <WelcomeOverlay
        isOpen={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onOpenHelp={() => {
          setWelcomeOpen(false);
          setTutorialOpen(true);
        }}
      />

      <TutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </BrowserRouter>
  );
}