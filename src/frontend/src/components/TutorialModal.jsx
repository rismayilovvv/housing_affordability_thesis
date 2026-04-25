import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const tutorialSteps = [
  {
    title: "Welcome to the dashboard",
    text: "This dashboard helps you analyse housing affordability in selected European countries using interactive charts, country comparison tools, a map view, and a mortgage simulator.",
    actionLabel: "Open Home",
    actionPath: "/",
  },
  {
    title: "Analyse mortgage relationships",
    text: "Use this page to inspect how housing prices relate to mortgage rates across the selected time period.",
    actionLabel: "Open Prices vs Mortgage",
    actionPath: "/mortgage",
  },
  {
    title: "Explore income dynamics",
    text: "Use this page to evaluate whether disposable income kept pace with housing price developments.",
    actionLabel: "Open Prices vs Income",
    actionPath: "/income",
  },
  {
    title: "Inspect labour market effects",
    text: "Use this page to explore whether housing price developments moved together with unemployment conditions.",
    actionLabel: "Open Prices vs Unemployment",
    actionPath: "/unemployment",
  },
  {
    title: "Compare countries directly",
    text: "Place two countries on the same chart and compare affordability-related indicators side by side.",
    actionLabel: "Open Compare Countries",
    actionPath: "/comparison",
  },
  {
    title: "Try the mortgage simulator",
    text: "Use the simulator to estimate monthly payments and compare them with income as a simplified affordability burden measure.",
    actionLabel: "Open Mortgage Simulator",
    actionPath: "/simulator",
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

      /* ENTER or SPACE -> next */
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();

        if (isLast) {
          onClose();
        } else {
          setStep((prev) => prev + 1);
        }

        return;
      }

      /* RIGHT ARROW -> next */
      if (event.key === "ArrowRight") {
        event.preventDefault();

        if (!isLast) {
          setStep((prev) => prev + 1);
        }

        return;
      }

      /* LEFT ARROW -> previous */
      if (event.key === "ArrowLeft") {
        event.preventDefault();

        if (!isFirst) {
          setStep((prev) => prev - 1);
        }

        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, isLast, isFirst]);

  if (!isOpen) return null;

  return (
    <div className="tutorial-overlay tutorial-overlay-corner" onClick={onClose}>
      <div
        className="tutorial-modal tutorial-modal-dark"
        onClick={(e) => e.stopPropagation()}
      >
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
              if (isLast) {
                onClose();
              } else {
                setStep((prev) => prev + 1);
              }
            }}
          >
            {isLast ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}