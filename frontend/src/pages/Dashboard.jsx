import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { EmptyState, ErrorMessage, LoadingState } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, projectApi } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    projectApi.list()
      .then(({ data }) => {
        if (active) setProjects(data.projects || []);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError, "Could not load your projects."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const stats = [
    { label: "Total projects", value: projects.length, mark: "▦" },
    { label: "Draft projects", value: projects.filter((project) => project.status === "Draft").length, mark: "◷" },
    { label: "In progress", value: projects.filter((project) => project.status === "In Progress").length, mark: "↗" },
    { label: "Completed", value: projects.filter((project) => project.status === "Completed").length, mark: "✓" },
  ];

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Welcome back, {user?.name?.split(" ")[0] || "Developer"}</h1>
          <p className="page-subtitle">Turn your ideas into structured software projects.</p>
        </div>
        <Link className="button button-primary" to="/projects/new"><span aria-hidden="true">+</span> Create new project</Link>
      </section>

      <ErrorMessage>{error}</ErrorMessage>
      <section className="stats-grid" aria-label="Project statistics">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <div className="stat-card-heading"><span>{stat.label}</span><span className="stat-mark">{stat.mark}</span></div>
            <strong>{loading ? "—" : stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">OVERVIEW</p><h2>Recent projects</h2></div>
          <Link className="text-link" to="/projects">View all projects <span aria-hidden="true">→</span></Link>
        </div>
        {loading ? <LoadingState label="Loading projects..." /> : error ? null : projects.length === 0 ? (
          <EmptyState
            title="No projects yet."
            description="Create your first project to start shaping your development roadmap."
            action={<Link className="button button-primary" to="/projects/new">Create your first project</Link>}
          />
        ) : (
          <div className="project-grid">
            {projects.slice(0, 3).map((project) => <ProjectCard key={project._id} project={project} />)}
          </div>
        )}
      </section>

      <section className="builder-banner">
        <div className="builder-symbol">&lt;/&gt;</div>
        <div>
          <p className="eyebrow">ON THE ROADMAP</p>
          <h2>AI Project Builder</h2>
          <p>Turn a product idea into requirements, architecture, and a development plan. AI generation is not enabled yet.</p>
        </div>
        <span className="coming-soon">Coming soon</span>
      </section>
    </>
  );
}
