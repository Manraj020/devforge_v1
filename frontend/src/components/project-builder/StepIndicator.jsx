const steps = ["Idea", "Type", "Stack", "Features", "Review"];

export default function StepIndicator({ currentStep, onSelect }) {
  return (
    <nav className="wizard-steps" aria-label="Project setup steps">
      {steps.map((step, index) => {
        const number = index + 1;
        const isComplete = number < currentStep;
        const isCurrent = number === currentStep;

        return (
          <div className="wizard-step-wrap" key={step}>
            <button
              className={`wizard-step${isCurrent ? " wizard-step-current" : ""}${isComplete ? " wizard-step-complete" : ""}`}
              type="button"
              onClick={() => isComplete && onSelect(number)}
              disabled={!isComplete}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Step ${number}: ${step}${isComplete ? ", completed" : ""}`}
            >
              <span className="wizard-step-number" aria-hidden="true">{isComplete ? "✓" : number}</span>
              <span className="wizard-step-label">{step}</span>
            </button>
            {index < steps.length - 1 && <span className={`wizard-step-line${isComplete ? " wizard-step-line-complete" : ""}`} aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
  );
}
