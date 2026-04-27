export default function WelcomeOverlay({ isOpen, onOpenHelp, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        <div className="section-badge">Welcome</div>

        <h2>Housing Affordability Dashboard</h2>

        <p>
          Explore European housing affordability through indicators, country
          comparison, interactive maps, and mortgage eligibility simulation.
        </p>

        <div className="welcome-actions">
          <button
            type="button"
            className="welcome-primary"
            onClick={onOpenHelp}
          >
            Open Guide
          </button>

          <button
            type="button"
            className="welcome-secondary"
            onClick={onClose}
          >
            Continue to Dashboard
          </button>
        </div>

        <div className="welcome-key-hint">
          Press <strong>Enter</strong> for guide or <strong>ESC</strong> to close
        </div>
      </div>
    </div>
  );
}