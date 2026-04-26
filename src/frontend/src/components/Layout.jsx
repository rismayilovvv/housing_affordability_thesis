import { NavLink, Outlet, useOutlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/mortgage", label: "Prices vs Mortgage" },
  { to: "/income", label: "Prices vs Income" },
  { to: "/unemployment", label: "Prices vs Unemployment" },
  { to: "/comparison", label: "Compare Countries" },
  { to: "/simulator", label: "Mortgage Simulator" },
  { to: "/methodology", label: "Methodology" },
];

export default function Layout({ children, theme, onToggleTheme, onOpenHelp }) {
  const outlet = useOutlet();

  return (
    <div className="site-shell">
      <header className="final-header">
        <div className="final-header-inner">
          <div className="final-brand">
            <div className="final-logo">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <path d="M10 30L32 12l22 18" />
                <path d="M17 28v25h30V28" />
                <path d="M25 53V39h14v14" />
                <path d="M23 34h5" />
                <path d="M36 34h5" />
              </svg>
            </div>

            <div>
              <div className="final-title">Housing Affordability Dashboard</div>
              <div className="final-subtitle">Explore. Compare. Understand.</div>
            </div>
          </div>

          <nav className="final-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `final-nav-link ${isActive ? "active" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="final-actions">
            <button type="button" onClick={onOpenHelp}>
              Help
            </button>

            <button type="button" onClick={onToggleTheme}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      </header>

      <main className="site-main final-main">
        {children || outlet || <Outlet />}
      </main>
    </div>
  );
}