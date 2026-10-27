const phases = [
  ["01", "Project Setup", "Define the workspace and establish the initial structure."],
  ["02", "Authentication", "Plan identity and account access if required by the project."],
  ["03", "Core Features", "Build the selected features in focused, testable increments."],
  ["04", "Testing", "Verify core user flows and address issues before launch."],
  ["05", "Deployment", "Prepare the application for a production environment."],
];

export default function AnalysisPreview({ analysis }) {
  return (
    <section className="analysis-preview" aria-labelledby="analysis-title">
      <div className="analysis-preview-heading">
        <div>
          <p className="eyebrow">LOCAL PREVIEW · NOT AI-GENERATED</p>
          <h2 id="analysis-title">Project Analysis</h2>
          <p>This is a frontend-only planning preview. Real AI analysis will be added in a future phase.</p>
        </div>
        <span className="preview-badge"><span aria-hidden="true">✧</span> Preview</span>
      </div>

      <div className="analysis-grid">
        <article className="analysis-card">
          <span className="analysis-card-index">01</span>
          <h3>Requirements</h3>
          <p>Planning prompts based on the project details you selected:</p>
          <ul className="analysis-requirements">
            {analysis.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
          </ul>
        </article>

        <article className="analysis-card">
          <span className="analysis-card-index">02</span>
          <h3>Recommended Stack</h3>
          <p>Your selected technologies are shown here; recommendations are not generated yet.</p>
          <dl className="stack-summary">
            {analysis.stack.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value || "Not selected"}</dd></div>
            ))}
          </dl>
        </article>

        <article className="analysis-card architecture-card">
          <span className="analysis-card-index">03</span>
          <h3>Architecture outline</h3>
          <p>A high-level placeholder based on your current stack selections.</p>
          <div className="architecture-flow">
            <span><small>FRONTEND</small>{analysis.architecture.frontend}</span>
            <b aria-hidden="true">↓</b>
            <span><small>BACKEND API</small>{analysis.architecture.backend}</span>
            <b aria-hidden="true">↓</b>
            <span><small>DATA</small>{analysis.architecture.database}</span>
          </div>
        </article>

        <article className="analysis-card roadmap-preview-card">
          <span className="analysis-card-index">04</span>
          <h3>Development roadmap</h3>
          <p>Example phases only; this is not a generated implementation plan.</p>
          <ol className="preview-roadmap">
            {phases.map(([number, title, description]) => (
              <li key={number}>
                <span>{number}</span>
                <div><strong>{title}</strong><small>{description}</small></div>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </section>
  );
}
