import { Link } from "react-router-dom";

export default function TaskItem({ task, projectName, projectId, onToggle, onDelete }) {
  return (
    <div className={`task-row${task.completed ? " task-completed" : ""}`}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={Boolean(task.completed)}
          onChange={(event) => onToggle(task, event.target.checked)}
          aria-label={`${task.completed ? "Mark incomplete" : "Complete"} ${task.title}`}
        />
        <span className="custom-checkbox" aria-hidden="true" />
      </label>
      <div className="task-copy">
        <span className="task-title">{task.title}</span>
        <div className="task-meta">
          <span className="category-pill">{task.category}</span>
          {projectName && projectId && (
            <Link className="task-project-link" to={`/projects/${projectId}`}>
              {projectName}
            </Link>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          className="icon-button danger-icon"
          type="button"
          onClick={() => onDelete(task)}
          aria-label={`Delete task ${task.title}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
