import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import TaskItem from "../components/TaskItem";
import ProjectAssets from "../components/ProjectAssets";
import { EmptyState, ErrorMessage, LoadingState } from "../components/Feedback";
import { getErrorMessage, projectApi, taskApi } from "../services/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");
  const [warning, setWarning] = useState(location.state?.warning || "");

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projectResponse, taskResponse] = await Promise.all([
        projectApi.get(id),
        taskApi.listForProject(id),
      ]);
      setProject(projectResponse.data.project);
      setTasks(taskResponse.data.tasks || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not load this project."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  async function refreshProject() {
    const { data } = await projectApi.get(id);
    setProject(data.project);
  }

  async function toggleTask(task, completed) {
    setError("");
    try {
      const { data } = await taskApi.update(task._id, { completed });
      setTasks((current) => current.map((item) => item._id === task._id ? data.task : item));
      await refreshProject();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not update this task."));
    }
  }

  if (loading) return <LoadingState label="Loading project..." />;
  if (error && !project) return <><ErrorMessage>{error}</ErrorMessage><Link className="button button-secondary" to="/projects">Back to projects</Link></>;
  if (!project) return <EmptyState title="Project not found." action={<Link className="button button-secondary" to="/projects">Back to projects</Link>} />;

  const progress = tasks.length
    ? Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100)
    : 0;
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const technologies = [
    { title: "Frontend", items: project.frontend || [] },
    { title: "Backend", items: project.backend || [] },
    { title: "Database", items: project.database || [] },
  ];
  const taskCategories = ["Features", "Frontend", "Backend", "Database"];

  return (
    <>
      <div className="breadcrumb"><Link to="/projects">My Projects</Link><span>/</span><span>{project.name}</span></div>
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
      {warning && <div className="alert alert-warning" role="status">{warning}</div>}
      <ErrorMessage>{error}</ErrorMessage>
      <section className="project-detail-header">
        <div className="project-detail-title">
          <span className="project-mark project-mark-large" aria-hidden="true">&lt;/&gt;</span>
          <div>
            <div className="detail-title-line"><h1>{project.name}</h1><span className={`status-pill status-${String(project.status || "Draft").toLowerCase().replace(" ", "-")}`}>{project.status || "Draft"}</span></div>
            <p>{project.description}</p>
            <span className="project-type">{project.type}</span>
          </div>
        </div>
        <div className="detail-progress">
          <div className="progress-label">
            <span>Project completion</span>
            <strong>{progress}%</strong>
          </div>
          <ProgressBar value={progress} />
          <p className="muted-text progress-task-count">
            {completedTaskCount} of {tasks.length} tasks completed
          </p>
        </div>
      </section>

      <div className="project-plan-grid">
        <section className="panel detail-panel technology-panel">
          <div className="section-heading section-heading-tight">
            <div><p className="eyebrow">PROJECT PLAN</p><h2>Technology &amp; Architecture</h2></div>
          </div>
          <div className="technology-summary-grid">
            {technologies.map((section) => (
              <article className="roadmap-item" key={section.title}>
                <h3>{section.title}</h3>
                {section.items.length ? (
                  <div className="tag-list">{section.items.map((item, itemIndex) => <span className="tech-tag" key={`${item}-${itemIndex}`}>{item}</span>)}</div>
                ) : <p className="muted-text roadmap-empty">Nothing added yet</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="panel detail-panel feature-panel">
          <div className="section-heading section-heading-tight">
            <div>
              <p className="eyebrow">PROJECT SCOPE</p>
              <h2>Project Features <span className="count-badge">{(project.features || []).length}</span></h2>
            </div>
          </div>
          {(project.features || []).length ? (
            <div className="tag-list feature-tag-list">
              {project.features.map((feature, index) => (
                <span className="tech-tag feature-tag" key={`${feature}-${index}`}>{feature}</span>
              ))}
            </div>
          ) : (
            <p className="muted-text roadmap-empty">No features were selected for this project.</p>
          )}
          <p className="feature-task-note">Selected features are added as project tasks when a project is created.</p>
        </section>
      </div>

      <section className="panel project-tasks-panel">
        <div className="project-tasks-heading">
          <div className="section-heading section-heading-tight">
            <div>
              <p className="eyebrow">PROJECT WORK</p>
              <h2>Tasks <span className="count-badge">{tasks.length}</span></h2>
              <p>Complete the features you selected for this project.</p>
            </div>
          </div>
          <span className="project-task-progress">{completedTaskCount} / {tasks.length} completed</span>
        </div>
        <div className="project-task-progress-bar">
          <div className="progress-label"><span>Project completion</span><strong>{progress}%</strong></div>
          <ProgressBar value={progress} />
        </div>
        {tasks.length === 0 ? (
          <EmptyState
            title="No feature tasks yet"
            description="Feature tasks are created automatically from the features selected when you create a project."
          />
        ) : (
          <div className="project-task-category-list">
            {taskCategories.map((category) => {
              const categoryTasks = tasks.filter((task) => task.category === category);
              if (!categoryTasks.length) return null;
              return (
                <section className="project-task-category" key={category}>
                  <div className="project-task-category-heading">
                    <h3>{category}</h3>
                    <span>{categoryTasks.filter((task) => task.completed).length}/{categoryTasks.length}</span>
                  </div>
                  <div className="task-list">
                    {categoryTasks.map((task) => <TaskItem key={task._id} task={task} onToggle={toggleTask} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      <ProjectAssets
        projectId={id}
        assets={project.assets || []}
        onUploaded={(asset) => {
          setProject((current) => ({
            ...current,
            assets: [...(current.assets || []), asset],
          }));
          setNotice("Project asset uploaded successfully.");
        }}
      />
    </>
  );
}
