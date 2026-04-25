import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import TutorialModal from "./components/TutorialModal";
import WelcomeOverlay from "./components/WelcomeOverlay";
import Home from "./pages/Home";
import MortgagePage from "./pages/MortgagePage";
import IncomePage from "./pages/IncomePage";
import UnemploymentPage from "./pages/UnemploymentPage";
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
    return localStorage.getItem("theme") || "dark";
  });

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showWelcomeOverlay, setShowWelcomeOverlay] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!showWelcomeOverlay) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowWelcomeOverlay(false);
        return;
      }

      setShowWelcomeOverlay(false);
      setIsTutorialOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWelcomeOverlay]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleOpenTutorial = () => {
    setShowWelcomeOverlay(false);
    setIsTutorialOpen(true);
  };

  const handleSkipWelcome = () => {
    setShowWelcomeOverlay(false);
  };

  return (
    <BrowserRouter>
        <ScrollToTop />
      <Layout
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenTutorial={handleOpenTutorial}
      >
        {showWelcomeOverlay && (
          <WelcomeOverlay
            onOpenTutorial={handleOpenTutorial}
            onSkip={handleSkipWelcome}
          />
        )}

        <TutorialModal
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mortgage" element={<MortgagePage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/unemployment" element={<UnemploymentPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/simulator" element={<MortgageSimulatorPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}