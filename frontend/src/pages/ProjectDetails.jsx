import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import TaskItem from "../components/TaskItem";
import { EmptyState, ErrorMessage, LoadingState } from "../components/Feedback";
import { getErrorMessage, projectApi, taskApi } from "../services/api";

const categories = ["Frontend", "Backend", "Database", "Features"];

export default function ProjectDetails() {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("Frontend");
  const [savingTask, setSavingTask] = useState(false);
  const [notice, setNotice] = useState(location.state?.message || "");

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

  async function addTask(event) {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    setError("");
    setNotice("");
    try {
      const { data } = await taskApi.create({ title: taskTitle.trim(), category: taskCategory, projectId: id });
      setTasks((current) => [...current, data.task]);
      setTaskTitle("");
      await refreshProject();
      setNotice("Task added.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not add this task."));
    } finally {
      setSavingTask(false);
    }
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

  async function deleteTask(task) {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setError("");
    try {
      await taskApi.remove(task._id);
      setTasks((current) => current.filter((item) => item._id !== task._id));
      await refreshProject();
      setNotice("Task deleted.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete this task."));
    }
  }

  if (loading) return <LoadingState label="Loading project..." />;
  if (error && !project) return <><ErrorMessage>{error}</ErrorMessage><Link className="button button-secondary" to="/projects">Back to projects</Link></>;
  if (!project) return <EmptyState title="Project not found." action={<Link className="button button-secondary" to="/projects">Back to projects</Link>} />;

  const progress = Number(project.progress) || 0;
  const completedTaskCount = tasks.filter((task) => task.completed).length;
  const roadmap = [
    { title: "Frontend", items: project.frontend || [] },
    { title: "Backend", items: project.backend || [] },
    { title: "Database", items: project.database || [] },
    { title: "Features", items: project.features || [] },
  ];

  return (
    <>
      <div className="breadcrumb"><Link to="/projects">My Projects</Link><span>/</span><span>{project.name}</span></div>
      {notice && <div className="alert alert-success" role="status">{notice}</div>}
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
            <span>Overall task completion</span>
            <strong>{progress}%</strong>
          </div>
          <ProgressBar value={progress} />
          <p className="muted-text progress-task-count">
            {completedTaskCount} of {tasks.length} tasks completed across all categories
          </p>
        </div>
      </section>

      <div className="detail-columns">
        <section className="panel detail-panel">
          <div className="section-heading section-heading-tight">
            <div><p className="eyebrow">PROJECT PLAN</p><h2>Roadmap</h2></div>
          </div>
          <div className="roadmap-grid">
            {roadmap.map((section, index) => (
              <article className="roadmap-item" key={section.title}>
                <span className="roadmap-number">0{index + 1}</span>
                <h3>{section.title}</h3>
                {section.items.length ? (
                  <div className="tag-list">{section.items.map((item, itemIndex) => <span className="tech-tag" key={`${item}-${itemIndex}`}>{item}</span>)}</div>
                ) : <p className="muted-text roadmap-empty">Nothing added yet</p>}
              </article>
            ))}
          </div>
        </section>

        <section className="panel detail-panel tasks-panel">
          <div className="section-heading section-heading-tight">
            <div><p className="eyebrow">BUILD IN STEPS</p><h2>Tasks <span className="count-badge">{tasks.length}</span></h2></div>
          </div>
          <form className="add-task-form" onSubmit={addTask}>
            <label className="field task-title-field">
              <span className="visually-hidden">Task title</span>
              <input value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} placeholder="Add a task..." maxLength="200" required />
            </label>
            <label className="field task-category-field">
              <span className="visually-hidden">Task category</span>
              <select value={taskCategory} onChange={(event) => setTaskCategory(event.target.value)}>
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <button className="button button-primary button-small" type="submit" disabled={savingTask}>{savingTask ? "Adding..." : "Add task"}</button>
          </form>
          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet." description="Add your first task to begin tracking project progress." />
          ) : (
            <div className="task-list">
              {tasks.map((task) => <TaskItem key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />)}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
