import SelectionCard from "./SelectionCard";

const projectTypes = [
  { name: "Web Application", icon: "⌘", description: "A browser-based product or experience." },
  { name: "Mobile Application", icon: "▯", description: "An app designed for phones and tablets." },
  { name: "SaaS", icon: "☁", description: "A subscription software product for users or teams." },
  { name: "E-Commerce", icon: "◇", description: "A storefront for products, orders, and payments." },
  { name: "Portfolio", icon: "▤", description: "A personal site to showcase your work." },
  { name: "Dashboard", icon: "▥", description: "A workspace for data, metrics, and operations." },
  { name: "API / Backend", icon: "{ }", description: "Services and APIs that power an application." },
  { name: "Other", icon: "✦", description: "Something unique that doesn’t fit a category." },
];

export default function ProjectTypeStep({ value, onChange }) {
  return (
    <section className="wizard-step-content">
      <div className="wizard-section-heading">
        <span className="wizard-section-icon" aria-hidden="true">▦</span>
        <div>
          <p className="eyebrow">STEP 02 · SET THE DIRECTION</p>
          <h2>What kind of project is it?</h2>
          <p>Choose the closest fit. This helps keep your project plan organized.</p>
        </div>
      </div>
      <div className="selection-grid project-type-grid">
        {projectTypes.map((item) => (
          <SelectionCard
            key={item.name}
            {...item}
            title={item.name}
            selected={value === item.name}
            onClick={() => onChange(item.name)}
          />
        ))}
      </div>
    </section>
  );
}
