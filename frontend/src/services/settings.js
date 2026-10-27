export const SETTINGS_STORAGE_KEY = "devforgeSettings";

export const defaultSettings = {
  profile: {
    username: "",
    bio: "",
    role: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    avatar: "",
  },
  appearance: {
    theme: "dark",
    accent: "#8d7bff",
    density: "comfortable",
    animations: true,
    reduceMotion: false,
    sidebarLabels: true,
    rememberSidebar: true,
  },
  notifications: {
    projectCreated: true,
    projectCompleted: true,
    taskCompleted: true,
    progressUpdates: false,
    aiAnalysis: true,
    aiGeneration: true,
    aiErrors: true,
    securityAlerts: true,
    accountActivity: true,
    productUpdates: false,
    inApp: true,
    email: false,
  },
  ai: {
    provider: "DevForge AI",
    assistance: true,
    recommendations: true,
    technologyRecommendations: true,
    roadmapGeneration: true,
    taskGeneration: true,
    codeAssistance: true,
    explanations: true,
    suggestionsBeforeChanges: true,
    responseStyle: "Balanced",
    frontend: "No preference",
    backend: "No preference",
    database: "No preference",
    language: "No preference",
    styling: "No preference",
  },
  workspace: {
    projectType: "Web Application",
    frontend: "No preference",
    backend: "No preference",
    database: "No preference",
    styling: "No preference",
    autoRoadmap: true,
    autoTasks: false,
    autoProgress: true,
    autoSaveDrafts: true,
    confirmDeleteProjects: true,
    confirmDeleteTasks: true,
    visibility: "Private",
  },
  security: {
    loginNotifications: true,
    suspiciousLoginAlerts: true,
  },
  developer: {
    developerMode: false,
  },
  privacy: {
    dataUsage: true,
    aiDataUsage: false,
    analytics: false,
  },
  preferences: {
    language: "English",
    dateFormat: "MMM D, YYYY",
    timeFormat: "12-hour",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    landingPage: "Dashboard",
    autoSave: true,
    confirmBeforeDeleting: true,
    onboardingTips: true,
    keyboardShortcuts: true,
  },
};

function mergeSettings(stored = {}) {
  return Object.fromEntries(
    Object.entries(defaultSettings).map(([section, defaults]) => [
      section,
      { ...defaults, ...(stored[section] || {}) },
    ]),
  );
}

export function readSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return mergeSettings(stored ? JSON.parse(stored) : {});
  } catch {
    return mergeSettings();
  }
}

export function saveSettings(settings) {
  const merged = mergeSettings(settings);
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent("devforge:settings-changed", { detail: merged }));
  return merged;
}

export function resetSettings() {
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
  const defaults = mergeSettings();
  window.dispatchEvent(new CustomEvent("devforge:settings-changed", { detail: defaults }));
  return defaults;
}

export function applyAppearance(appearance) {
  const root = document.documentElement;
  root.dataset.theme = appearance.theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark")
    : appearance.theme;
  root.dataset.themeMode = appearance.theme;
  root.dataset.density = appearance.density;
  root.dataset.sidebarLabels = String(appearance.sidebarLabels);
  root.style.setProperty("--accent", appearance.accent);
  root.style.setProperty("--accent-strong", appearance.accent);
  root.style.setProperty("--accent-soft", `${appearance.accent}22`);
  root.dataset.reduceMotion = String(appearance.reduceMotion || !appearance.animations);
}
