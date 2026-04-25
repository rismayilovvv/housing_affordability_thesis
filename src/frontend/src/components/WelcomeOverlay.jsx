export default function WelcomeOverlay({ onOpenTutorial, onSkip }) {
  return (
    <div className="welcome-overlay welcome-overlay-corner">
      <div className="welcome-overlay-card welcome-overlay-card-pro">
        <div className="welcome-card-icon">⌂</div>

        <div className="welcome-content">
          <h2>Welcome to the Housing Affordability Dashboard</h2>
          <p>
            Press any key to start the guided tour and discover how to use the
            dashboard effectively.
          </p>
          <p className="welcome-secondary-text">
            Press <strong>Esc</strong> to continue without the tour.
          </p>

          <div className="welcome-overlay-actions">
            <button
              type="button"
              className="tutorial-button secondary"
              onClick={onSkip}
            >
              Skip tour
            </button>

            <button
              type="button"
              className="tutorial-button primary"
              onClick={onOpenTutorial}
            >
              Start tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}