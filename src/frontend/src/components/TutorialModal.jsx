import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const tutorialSteps = [
  {
    title: "Welcome to the dashboard",
    text: "Explore housing affordability across Europe using interactive indicators, country comparison, a map view, and a mortgage eligibility simulator.",
    actionLabel: "Open Home",
    actionPath: "/",
  },
  {
    title: "Analyze affordability indicators",
    text: "Use the Indicator Analysis page to compare HPI, mortgage rates, income, and unemployment in one indexed chart.",
    actionLabel: "Open Indicator Analysis",
    actionPath: "/indicators",
  },
  {
    title: "Compare countries",
    text: "Select up to four countries and compare one chosen affordability indicator across national markets.",
    actionLabel: "Open Compare Countries",
    actionPath: "/comparison",
  },
  {
    title: "Use the mortgage eligibility simulator",
    text: "Estimate whether a simulated borrower profile fits conservative lending thresholds such as LTV, DSTI, LTI, and loan maturity.",
    actionLabel: "Open Mortgage Simulator",
    actionPath: "/simulator",
  },
  {
    title: "Review methodology",
    text: "Open the methodology section to understand the selected indicators, data sources, limitations, and analytical approach.",
    actionLabel: "Open Methodology",
    actionPath: "/methodology",
  },
];

export default function TutorialModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const current = useMemo(() => tutorialSteps[step], [step]);
  const isFirst = step === 0;
  const isLast = step === tutorialSteps.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (isLast) onClose();
        else setStep((prev) => prev + 1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!isLast) setStep((prev) => prev + 1);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (!isFirst) setStep((prev) => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLast, isFirst]);

  if (!isOpen) return null;

  return (
    <div className="tutorial-overlay tutorial-overlay-corner" onClick={onClose}>
      <div className="tutorial-modal tutorial-modal-dark" onClick={(e) => e.stopPropagation()}>
        <div className="tutorial-topline">
          <div className="tutorial-step-count">
            Step {step + 1} of {tutorialSteps.length}
          </div>

          <button
            type="button"
            className="tutorial-close-button"
            onClick={onClose}
            aria-label="Close tutorial"
          >
            ×
          </button>
        </div>

        <h3>{current.title}</h3>
        <p>{current.text}</p>

{/*         <div className="keyboard-hint"> */}
{/*           ESC close · ← back · → next · Enter continue */}
{/*         </div> */}

        <div className="tutorial-step-action">
          <button
            type="button"
            className="tutorial-feature-button"
            onClick={() => {
              navigate(current.actionPath);
              onClose();
            }}
          >
            {current.actionLabel}
          </button>
        </div>

        <div className="tutorial-dots">
          {tutorialSteps.map((_, index) => (
            <span
              key={`dot-${index}`}
              className={`tutorial-dot ${index === step ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="tutorial-actions">
          <button
            type="button"
            className="tutorial-button secondary"
            onClick={() => (isFirst ? onClose() : setStep((prev) => prev - 1))}
          >
            {isFirst ? "Close" : "Back"}
          </button>

          <button
            type="button"
            className="tutorial-button primary"
            onClick={() => {
              if (isLast) onClose();
              else setStep((prev) => prev + 1);
            }}
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}