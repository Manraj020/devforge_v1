const MAX_IDEA_LENGTH = 2000;

export default function ProjectIdeaStep({ idea, onChange }) {
  return (
    <section className="wizard-step-content">
      <div className="wizard-section-heading">
        <span className="wizard-section-icon" aria-hidden="true">✎</span>
        <div>
          <p className="eyebrow">STEP 01 · START WITH THE IDEA</p>
          <h2>What do you want to build?</h2>
          <p>Describe the product in your own words. You can refine the details as you go.</p>
        </div>
      </div>
      <label className="idea-input-wrap">
        <span className="visually-hidden">Describe your project idea</span>
        <textarea
          autoFocus
          value={idea}
          onChange={(event) => onChange(event.target.value)}
          placeholder="I want to build a food delivery platform where users can browse restaurants, view menus, order food, track deliveries, and leave reviews."
          maxLength={MAX_IDEA_LENGTH}
          rows="8"
          required
        />
        <span className="idea-character-count">{idea.length} / {MAX_IDEA_LENGTH}</span>
      </label>
      <div className="idea-tip"><span aria-hidden="true">✦</span> Tip: mention who it’s for and the main problem it solves.</div>
    </section>
  );
}
