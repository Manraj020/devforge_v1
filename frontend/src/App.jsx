import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { applyAppearance, readSettings } from "./services/settings";
import CreateProject from "./pages/CreateProject";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";

export default function App() {
  useEffect(() => {
    applyAppearance(readSettings().appearance);
    function onSettingsChanged(event) {
      const settings = event.detail || readSettings();
      applyAppearance(settings.appearance);
    }
    function onSystemThemeChanged() {
      if (document.documentElement.dataset.themeMode === "system") {
        applyAppearance({ ...readSettings().appearance, theme: "system" });
      }
    }
    window.addEventListener("devforge:settings-changed", onSettingsChanged);
    const colorScheme = window.matchMedia("(prefers-color-scheme: light)");
    colorScheme.addEventListener("change", onSystemThemeChanged);
    return () => {
      window.removeEventListener("devforge:settings-changed", onSettingsChanged);
      colorScheme.removeEventListener("change", onSystemThemeChanged);
    };
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/tasks" element={<Navigate to="/projects" replace />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
