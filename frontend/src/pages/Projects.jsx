import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { EmptyState, ErrorMessage, LoadingState } from "../components/Feedback";
import { ConfirmDialog } from "../components/settings/SettingsControls";
import { getErrorMessage, projectApi, taskApi } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProjects() {
    setLoading(true);
    setError("");
    try {
      const { data } = await projectApi.list();
      setProjects(data.projects || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not load your projects."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesSearch = !query || `${project.name} ${project.description} ${project.type}`.toLowerCase().includes(query);
      return matchesSearch && (status === "All statuses" || project.status === status);
    });
  }, [projects, search, status]);

  async function deleteProject() {
    if (!projectToDelete || deleting) return;
    setError("");
    setDeleting(true);
    try {
      const { data } = await taskApi.listForProject(projectToDelete._id);
      const taskResults = await Promise.allSettled(
        (data.tasks || []).map((task) => taskApi.remove(task._id)),
      );
      const failedTaskDeletions = taskResults.filter((result) => result.status === "rejected").length;
      if (failedTaskDeletions) {
        setError(`Could not delete ${failedTaskDeletions} associated task${failedTaskDeletions === 1 ? "" : "s"}. The project was not deleted.`);
        return;
      }

      await projectApi.remove(projectToDelete._id);
      setProjects((current) => current.filter((item) => item._id !== projectToDelete._id));
      setProjectToDelete(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete this project."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <section className="page-heading-row">
        <div><p className="eyebrow">WORKSPACE</p><h1>My Projects</h1><p className="page-subtitle">Keep every idea and build in one place.</p></div>
        <Link className="button button-primary" to="/projects/new"><span aria-hidden="true">+</span> New project</Link>
      </section>
      <ErrorMessage>{error}</ErrorMessage>
      <section className="filter-bar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." aria-label="Search projects" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter projects by status">
          <option>All statuses</option>
          <option>Draft</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <span className="muted-text result-count">{filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}</span>
      </section>
      {loading ? <LoadingState label="Loading projects..." /> : filteredProjects.length === 0 ? (
        <EmptyState
          title={projects.length ? "No matching projects." : "No projects yet."}
          description={projects.length ? "Try changing your search or status filter." : "Create your first project to get started."}
          action={!projects.length && <Link className="button button-primary" to="/projects/new">Create your first project</Link>}
        />
      ) : (
        <div className="project-grid project-grid-wide">
          {filteredProjects.map((project) => <ProjectCard key={project._id} project={project} onDelete={setProjectToDelete} />)}
        </div>
      )}
      {projectToDelete && (
        <ConfirmDialog
          title="Delete project?"
          description="This will permanently delete this project and its associated tasks."
          onCancel={() => setProjectToDelete(null)}
          onConfirm={deleteProject}
          busy={deleting}
          confirmLabel="Delete project"
        />
      )}
    </>
  );
}
