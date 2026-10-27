import { useState } from "react";

const featureOptions = [
  "Authentication",
  "User Profiles",
  "Search",
  "Notifications",
  "Payments",
  "Chat",
  "Admin Dashboard",
  "File Upload",
  "Reviews & Ratings",
  "Shopping Cart",
  "Order Management",
  "Analytics",
  "Dark Mode",
  "API Integration",
];

export default function FeatureSelectionStep({ features, customFeatures, onToggle, onAddCustom, onRemoveCustom }) {
  const [customFeature, setCustomFeature] = useState("");

  function addFeature(event) {
    event.preventDefault();
    const value = customFeature.trim();
    if (!value) return;
    onAddCustom(value);
    setCustomFeature("");
  }

  return (
    <section className="wizard-step-content">
      <div className="wizard-section-heading">
        <span className="wizard-section-icon" aria-hidden="true">✦</span>
        <div>
          <p className="eyebrow">STEP 04 · DEFINE THE SCOPE</p>
          <h2>What should your project include?</h2>
          <p>Select the features that matter. Add your own if you don’t see them here.</p>
        </div>
      </div>
      <div className="feature-chip-grid">
        {featureOptions.map((feature) => {
          const selected = features.includes(feature);
          return (
            <button
              className={`feature-chip${selected ? " feature-chip-selected" : ""}`}
              key={feature}
              type="button"
              onClick={() => onToggle(feature)}
              aria-pressed={selected}
            >
              <span aria-hidden="true">{selected ? "✓" : "+"}</span>{feature}
            </button>
          );
        })}
      </div>
      {customFeatures.length > 0 && (
        <div className="custom-feature-list" aria-label="Custom features">
          {customFeatures.map((feature) => (
            <span className="feature-chip feature-chip-selected custom-feature-chip" key={feature}>
              <span aria-hidden="true">✓</span>{feature}
              <button type="button" onClick={() => onRemoveCustom(feature)} aria-label={`Remove ${feature}`}>×</button>
            </span>
          ))}
        </div>
      )}
      <form className="custom-feature-form" onSubmit={addFeature}>
        <label className="visually-hidden" htmlFor="custom-feature">Custom feature name</label>
        <input
          id="custom-feature"
          value={customFeature}
          onChange={(event) => setCustomFeature(event.target.value)}
          placeholder="Add a custom feature..."
          maxLength="80"
        />
        <button className="button button-secondary" type="submit" disabled={!customFeature.trim()}>
          <span aria-hidden="true">+</span> Custom feature
        </button>
      </form>
      <p className="feature-selection-count">{features.length + customFeatures.length} {features.length + customFeatures.length === 1 ? "feature" : "features"} selected</p>
    </section>
  );
}
