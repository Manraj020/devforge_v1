import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

function formatDate(date) {
  if (!date) return "Recently";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Recently"
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectCard({ project, onDelete }) {
  const progress = Number(project.progress) || 0;

  return (
    <article className="project-card">
      <div className="project-card-top">
        <span className="project-mark" aria-hidden="true">&lt;/&gt;</span>
        <span className={`status-pill status-${String(project.status || "Draft").toLowerCase().replace(" ", "-")}`}>
          {project.status || "Draft"}
        </span>
      </div>
      <h3>{project.name}</h3>
      <p className="project-description">{project.description}</p>
      <span className="project-type">{project.type}</span>

      <div className="project-progress">
        <div className="progress-label">
          <span>Overall progress</span>
          <strong>{progress}%</strong>
        </div>
        <ProgressBar value={progress} />
      </div>

      <div className="project-card-footer">
        <span className="muted-text">Updated {formatDate(project.updatedAt)}</span>
        <div className="card-actions">
          <Link className="text-link" to={`/projects/${project._id}`}>
            Open project <span aria-hidden="true">↗</span>
          </Link>
          {onDelete && (
            <button
              className="project-card-delete"
              type="button"
              onClick={() => onDelete(project)}
              aria-label={`Delete project ${project.name}`}
              title="Delete project"
            >
              <span aria-hidden="true">×</span>
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
