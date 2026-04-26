import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/mortgage", label: "Prices vs Mortgage", icon: "%" },
  { to: "/income", label: "Prices vs Income", icon: "◉" },
  { to: "/unemployment", label: "Prices vs Unemployment", icon: "▣" },
  { to: "/comparison", label: "Compare Countries", icon: "☷" },
  { to: "/simulator", label: "Mortgage Simulator", icon: "▦" },
  { to: "/methodology", label: "Methodology", icon: "◫" },
];

export default function Layout({ theme, onToggleTheme, onOpenHelp }) {
  return (
    <div className="site-shell">
      <header className="app-toolbar premium-toolbar">
        <div className="app-toolbar-inner premium-toolbar-inner">
          <div className="app-toolbar-left premium-brand">
            <div className="premium-logo" aria-hidden="true">
              <svg viewBox="0 0 64 64" role="img">
                <path d="M12 30.5L32 12l20 18.5" />
                <path d="M18 28v24h28V28" />
                <path d="M26 52V38h12v14" />
                <path d="M23 33h6" />
                <path d="M35 33h6" />
                <path d="M18 52h28" />
              </svg>
            </div>

            <div className="premium-brand-divider" />

            <div>
              <div className="app-toolbar-title premium-title">
                Housing Affordability Dashboard
              </div>
              <div className="app-toolbar-subtitle premium-subtitle">
                Explore. Compare. Understand.
              </div>
            </div>
          </div>

          <div className="app-toolbar-right premium-actions">
            <button
              type="button"
              className="toolbar-help-button premium-action-button"
              onClick={onOpenHelp}
            >
              <span className="action-icon">?</span>
              Help
            </button>

            <button
              type="button"
              className="theme-toggle premium-action-button"
              onClick={onToggleTheme}
            >
              <span className="action-icon">
                {theme === "dark" ? "☀" : "☾"}
              </span>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>

        <div className="top-nav-wrapper premium-nav-wrapper">
          <nav className="top-nav premium-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `top-nav-link premium-nav-link ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}