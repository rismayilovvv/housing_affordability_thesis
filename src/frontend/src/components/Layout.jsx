import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Layout({
  children,
  theme,
  onToggleTheme,
  onOpenTutorial,
}) {
  const location = useLocation();

  const navLinkClass = (path) =>
    `top-nav-link ${location.pathname === path ? "active" : ""}`;

  return (
    <div className="site-shell dashboard-shell">
      <header className="app-toolbar">
        <div className="app-toolbar-inner">
          <div className="app-toolbar-left">
            <div className="app-logo-mark">⌂</div>
            <div className="app-toolbar-branding">
              <div className="app-toolbar-title">
                Housing Affordability Dashboard
              </div>
              <div className="app-toolbar-subtitle">
                Explore. Compare. Understand.
              </div>
            </div>
          </div>

          <div className="app-toolbar-right">
            <button
              type="button"
              className="toolbar-help-button"
              onClick={onOpenTutorial}
            >
              Help
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="top-nav-wrapper top-nav-wrapper-dark">
          <nav className="top-nav top-nav-dark">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link to="/mortgage" className={navLinkClass("/mortgage")}>
              Prices vs Mortgage
            </Link>
            <Link to="/income" className={navLinkClass("/income")}>
              Prices vs Income
            </Link>
            <Link to="/unemployment" className={navLinkClass("/unemployment")}>
              Prices vs Unemployment
            </Link>
            <Link to="/comparison" className={navLinkClass("/comparison")}>
              Compare Countries
            </Link>
            <Link to="/simulator" className={navLinkClass("/simulator")}>
              Mortgage Simulator
            </Link>
            <Link to="/methodology" className={navLinkClass("/methodology")}>
              Methodology
            </Link>
          </nav>
        </div>
      </header>

      <main className="site-main dashboard-main">{children}</main>
    </div>
  );
}