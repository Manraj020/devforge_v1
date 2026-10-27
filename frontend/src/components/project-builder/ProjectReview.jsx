function ReviewRow({ label, children }) {
  return (
    <div className="review-row">
      <span className="review-label">{label}</span>
      <div className="review-value">{children}</div>
    </div>
  );
}

function displayValue(value) {
  return value || <span className="review-empty">Not selected</span>;
}

export default function ProjectReview({ form, onNameChange }) {
  const features = [...form.features, ...form.customFeatures];

  return (
    <section className="wizard-step-content">
      <div className="wizard-section-heading">
        <span className="wizard-section-icon" aria-hidden="true">⌕</span>
        <div>
          <p className="eyebrow">STEP 05 · CHECK YOUR PLAN</p>
          <h2>Review your project</h2>
          <p>Make sure everything looks right before creating your project.</p>
        </div>
      </div>
      <div className="review-card">
        <label className="field review-name-field">
          <span>Project name <b>*</b></span>
          <input
            autoFocus
            value={form.name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="e.g. Food Factory"
            maxLength="100"
            required
          />
        </label>
        <ReviewRow label="Project idea">
          <p className="review-idea">{form.idea}</p>
        </ReviewRow>
        <ReviewRow label="Project type">{displayValue(form.projectType)}</ReviewRow>
        <ReviewRow label="Frontend">{displayValue(form.frontend)}</ReviewRow>
        <ReviewRow label="Backend">{displayValue(form.backend)}</ReviewRow>
        <ReviewRow label="Database">{displayValue(form.database)}</ReviewRow>
        <ReviewRow label="Features">
          {features.length ? (
            <div className="tag-list">{features.map((feature) => <span className="tech-tag" key={feature}>{feature}</span>)}</div>
          ) : <span className="review-empty">No features selected</span>}
        </ReviewRow>
      </div>
    </section>
  );
}
