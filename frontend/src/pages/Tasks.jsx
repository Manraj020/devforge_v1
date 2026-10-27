import { useEffect, useState } from "react";
import TaskItem from "../components/TaskItem";
import { EmptyState, ErrorMessage, LoadingState } from "../components/Feedback";
import { getErrorMessage, projectApi, taskApi } from "../services/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const { data } = await projectApi.list();
      const projects = data.projects || [];
      const taskGroups = await Promise.all(
        projects.map(async (project) => {
          const response = await taskApi.listForProject(project._id);
          return (response.data.tasks || []).map((task) => ({
            ...task,
            projectName: project.name,
            projectId: project._id,
          }));
        }),
      );
      setTasks(taskGroups.flat());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not load your tasks."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function toggleTask(task, completed) {
    setError("");
    try {
      const { data } = await taskApi.update(task._id, { completed });
      setTasks((current) => current.map((item) => item._id === task._id ? { ...item, ...data.task } : item));
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
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete this task."));
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <>
      <section className="page-heading-row">
        <div><p className="eyebrow">YOUR WORK QUEUE</p><h1>Tasks</h1><p className="page-subtitle">The next steps across all your projects.</p></div>
        {!loading && <span className="task-summary">{completedCount} of {tasks.length} completed</span>}
      </section>
      <ErrorMessage>{error}</ErrorMessage>
      <section className="panel global-tasks-panel">
        <div className="section-heading section-heading-tight">
          <div><p className="eyebrow">ALL PROJECTS</p><h2>Task list</h2></div>
        </div>
        {loading ? <LoadingState label="Loading tasks..." /> : tasks.length === 0 ? (
          <EmptyState title="No tasks yet." description="Create a project and add tasks to see your work here." />
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                projectName={task.projectName}
                projectId={task.projectId}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
