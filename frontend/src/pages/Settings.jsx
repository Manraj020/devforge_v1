import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ConfirmDialog,
  SaveBar,
} from "../components/settings/SettingsControls";
import {
  SettingsSectionContent,
  settingsSections,
} from "./SettingsSections";
import {
  applyAppearance,
  readSettings,
  resetSettings,
  saveSettings,
} from "../services/settings";
import { getErrorMessage, projectApi, systemApi, taskApi } from "../services/api";

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(readSettings);
  const [savedSettings, setSavedSettings] = useState(readSettings);
  const [activeSection, setActiveSection] = useState("profile");
  const [toast, setToast] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [confirmationValue, setConfirmationValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [checkingSystem, setCheckingSystem] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ backend: "Not checked" });

  const activeDetails = settingsSections.find((section) => section.id === activeSection);
  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings],
  );

  useEffect(() => {
    applyAppearance(settings.appearance);
  }, [settings.appearance]);

  useEffect(() => {
    let active = true;
    systemApi.checkBackend()
      .then(() => active && setSystemStatus({ backend: "Online" }))
      .catch(() => active && setSystemStatus({ backend: "Unavailable" }));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!confirmation) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape" && !busy) setConfirmation("");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmation, busy]);

  const notify = useCallback((message, kind = "success") => {
    setToast({ message, kind });
  }, []);

  function update(section, key, value) {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [key]: value },
    }));
  }

  function saveChanges() {
    try {
      const saved = saveSettings(settings);
      setSettings(saved);
      setSavedSettings(saved);
      notify("Settings saved successfully.");
    } catch (error) {
      notify(getErrorMessage(error, "Failed to save settings in this browser."), "error");
    }
  }

  function cancelChanges() {
    setSettings(savedSettings);
    setToast(null);
  }

  function selectSection(section) {
    if (section === activeSection) return;
    if (dirty && !window.confirm("Discard your unsaved settings changes?")) return;
    if (dirty) cancelChanges();
    setActiveSection(section);
  }

  async function exportData(kind) {
    setExportBusy(true);
    try {
      if (kind === "profile") {
        downloadJson("devforge-profile.json", {
          account: { name: user?.name || "", email: user?.email || "" },
          localProfile: settings.profile,
          exportedAt: new Date().toISOString(),
        });
        notify("Profile data exported.");
        return;
      }

      const { data } = await projectApi.list();
      const projects = data.projects || [];
      if (kind === "projects") {
        downloadJson("devforge-projects.json", { exportedAt: new Date().toISOString(), projects });
        notify(`${projects.length} projects exported.`);
        return;
      }

      const taskGroups = await Promise.all(projects.map(async (project) => {
        const response = await taskApi.listForProject(project._id);
        return (response.data.tasks || []).map((task) => ({
          ...task,
          projectName: project.name,
        }));
      }));
      const tasks = taskGroups.flat();
      downloadJson("devforge-tasks.json", { exportedAt: new Date().toISOString(), tasks });
      notify(`${tasks.length} tasks exported.`);
    } catch (error) {
      notify(getErrorMessage(error, "Could not export your data."), "error");
    } finally {
      setExportBusy(false);
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem("devforge-project-wizard-draft");
      setConfirmation("");
      notify("Saved project-builder draft cleared.");
    } catch (error) {
      notify(getErrorMessage(error, "Could not clear the local draft."), "error");
    }
  }

  function startConfirmation(action) {
    setConfirmationValue("");
    setConfirmation(action);
  }

  async function deleteAllProjects() {
    setBusy(true);
    try {
      const { data } = await projectApi.list();
      const projects = data.projects || [];
      const taskGroups = await Promise.all(projects.map(async (project) => {
        const response = await taskApi.listForProject(project._id);
        return response.data.tasks || [];
      }));
      await Promise.all(taskGroups.flat().map((task) => taskApi.remove(task._id)));
      await Promise.all(projects.map((project) => projectApi.remove(project._id)));
      setConfirmation("");
      notify(`Deleted ${projects.length} projects and ${taskGroups.flat().length} tasks.`);
    } catch (error) {
      notify(getErrorMessage(error, "Could not delete all projects. Some items may have been removed; refresh Projects to check."), "error");
    } finally {
      setBusy(false);
    }
  }

  function confirmAction() {
    if (confirmation === "delete-projects") {
      deleteAllProjects();
      return;
    }
    if (confirmation === "reset") {
      try {
        const defaults = resetSettings();
        localStorage.removeItem("devforge-project-wizard-draft");
        setSettings(defaults);
        setSavedSettings(defaults);
        setConfirmation("");
        notify("Local DevForge preferences were reset.");
      } catch (error) {
        notify(getErrorMessage(error, "Could not reset local preferences."), "error");
      }
    }
  }

  async function checkSystem() {
    setCheckingSystem(true);
    try {
      await systemApi.checkBackend();
      setSystemStatus({ backend: "Online" });
      notify("Backend API is reachable.");
    } catch {
      setSystemStatus({ backend: "Unavailable" });
      notify("Backend API could not be reached.", "error");
    } finally {
      setCheckingSystem(false);
    }
  }

  function renderSection() {
    return (
      <SettingsSectionContent
        section={activeSection}
        settings={settings}
        update={update}
        user={user}
        logout={logout}
        notify={notify}
        actions={{
          onExport: exportData,
          exportBusy,
          onClearDraft: clearDraft,
          onReset: () => startConfirmation("reset"),
          onDeleteProjects: () => startConfirmation("delete-projects"),
          environment: import.meta.env.MODE === "production" ? "Production" : "Development",
          systemStatus,
          checkSystem,
          checkingSystem,
        }}
      />
    );
  }

  return (
    <div className="settings-page">
      <section className="form-page-heading settings-page-heading">
        <p className="eyebrow">WORKSPACE CONFIGURATION</p>
        <h1>Settings</h1>
        <p className="page-subtitle">Manage your profile, workspace, and DevForge preferences.</p>
      </section>

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          <span className="settings-nav-title">SETTINGS</span>
          {settingsSections.map((section) => (
            <button
              className={`settings-nav-item${section.id === activeSection ? " settings-nav-item-active" : ""}`}
              type="button"
              key={section.id}
              onClick={() => selectSection(section.id)}
              aria-current={section.id === activeSection ? "page" : undefined}
            >
              <span className="settings-nav-icon" aria-hidden="true">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
          <div className="settings-nav-note"><span className="online-dot" />Preferences saved locally</div>
        </nav>

        <main className="settings-content">
          <div className="settings-section-header">
            <div><p className="eyebrow">SETTINGS</p><h2>{activeDetails?.label}</h2><p>{activeDetails?.description}</p></div>
            {activeSection === "profile" && <span className="settings-badge">Local profile</span>}
          </div>
          {renderSection()}
        </main>
      </div>

      <SaveBar dirty={dirty} onSave={saveChanges} onCancel={cancelChanges} />
      {toast && <div className={`settings-toast settings-toast-${toast.kind}`} role="status"><span aria-hidden="true">{toast.kind === "error" ? "!" : "✓"}</span>{toast.message}<button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button></div>}
      {confirmation === "delete-projects" && (
        <ConfirmDialog
          title="Delete all projects?"
          description="This permanently deletes every project and its tasks through the existing API. This cannot be undone. Your account and sign-in stay unchanged."
          confirmationText="DELETE PROJECTS"
          value={confirmationValue}
          onChange={setConfirmationValue}
          onCancel={() => !busy && setConfirmation("")}
          onConfirm={confirmAction}
          busy={busy}
        />
      )}
      {confirmation === "reset" && (
        <ConfirmDialog
          title="Reset DevForge preferences?"
          description="All saved local settings and the unsubmitted project-builder draft will be removed. Your account, projects, tasks, and sign-in will not be affected."
          confirmationText="RESET PREFERENCES"
          value={confirmationValue}
          onChange={setConfirmationValue}
          onCancel={() => setConfirmation("")}
          onConfirm={confirmAction}
          busy={busy}
        />
      )}
    </div>
  );
}
