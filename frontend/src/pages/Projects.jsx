import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { EmptyState, ErrorMessage, LoadingState } from "../components/Feedback";
import { getErrorMessage, projectApi } from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function deleteProject(project) {
    if (!window.confirm(`Delete "${project.name}"? This action cannot be undone.`)) return;
    setError("");
    try {
      await projectApi.remove(project._id);
      setProjects((current) => current.filter((item) => item._id !== project._id));
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not delete this project."));
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
          {filteredProjects.map((project) => <ProjectCard key={project._id} project={project} onDelete={deleteProject} />)}
        </div>
      )}
    </>
  );
}
