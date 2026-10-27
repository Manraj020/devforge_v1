import SelectionCard from "./SelectionCard";

const groups = [
  {
    key: "frontend",
    title: "Choose your frontend",
    description: "Pick the interface technology you’d like to build with.",
    options: [
      ["React", "⚛", "Flexible UI library with a broad ecosystem."],
      ["Next.js", "▲", "React framework for full-stack web experiences."],
      ["Vue.js", "◇", "Progressive framework for approachable interfaces."],
      ["Angular", "◈", "Full-featured framework for structured applications."],
      ["HTML / CSS / JavaScript", "⌘", "The fundamentals for a lightweight website."],
      ["Svelte", "✦", "Compile-time framework for lean interfaces."],
      ["AI Recommended", "✧", "Leave this choice open for a future recommendation."],
    ],
  },
  {
    key: "backend",
    title: "Choose your backend",
    description: "Select a server framework, or start without a custom backend.",
    options: [
      ["Node.js + Express", "⬡", "JavaScript server and lightweight web framework."],
      ["Django", "◉", "Batteries-included Python web framework."],
      ["Flask", "◌", "Lightweight and flexible Python framework."],
      ["FastAPI", "ϟ", "Modern Python framework for APIs."],
      ["Spring Boot", "☕", "Java framework for production applications."],
      ["Laravel", "◈", "Expressive PHP framework for web applications."],
      ["No Backend", "—", "A frontend-only project for now."],
      ["AI Recommended", "✧", "Leave this choice open for a future recommendation."],
    ],
  },
  {
    key: "database",
    title: "Choose your database",
    description: "Choose a data store, or leave this open for now.",
    options: [
      ["MongoDB", "◉", "Document database for flexible data models."],
      ["PostgreSQL", "▤", "Reliable relational database with rich features."],
      ["MySQL", "▦", "Popular relational database for web applications."],
      ["Firebase", "✦", "Hosted application services and data tools."],
      ["Supabase", "◈", "Open-source platform built around PostgreSQL."],
      ["SQLite", "▣", "Compact database embedded in your application."],
      ["No Database", "—", "No database required at this stage."],
      ["AI Recommended", "✧", "Leave this choice open for a future recommendation."],
    ],
  },
];

export default function TechnologyStep({ selections, onChange }) {
  return (
    <section className="wizard-step-content technology-step-content">
      <div className="wizard-section-heading">
        <span className="wizard-section-icon" aria-hidden="true">⌘</span>
        <div>
          <p className="eyebrow">STEP 03 · CHOOSE YOUR TOOLS</p>
          <h2>Shape your technology stack</h2>
          <p>Choose a starting point for each layer. You can leave any selection open.</p>
        </div>
      </div>
      {groups.map((group) => (
        <section className="technology-group" key={group.key}>
          <div className="technology-group-heading">
            <div><h3>{group.title}</h3><p>{group.description}</p></div>
            {selections[group.key] && <button type="button" className="clear-selection" onClick={() => onChange(group.key, "")}>Clear</button>}
          </div>
          <div className="selection-grid technology-grid">
            {group.options.map(([name, icon, description]) => (
              <SelectionCard
                key={name}
                icon={icon}
                title={name === "AI Recommended" ? "Let DevForge recommend" : name}
                description={description}
                featured={name === "AI Recommended"}
                selected={selections[group.key] === name}
                onClick={() => onChange(group.key, selections[group.key] === name ? "" : name)}
              />
            ))}
          </div>
        </section>
      ))}
      <p className="wizard-note"><span aria-hidden="true">✧</span> Recommendations are a placeholder until real AI analysis is added.</p>
    </section>
  );
}
