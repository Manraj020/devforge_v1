import { useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { SettingsCard, SettingRow, SettingsSelect, Toggle, ComingSoon } from "../components/settings/SettingsControls";

const projectTypes = ["Web Application", "Mobile Application", "SaaS", "E-Commerce", "Portfolio", "Dashboard", "API / Backend", "Other"];
const frontends = ["No preference", "React", "Next.js", "Vue.js", "Angular", "Svelte", "HTML / CSS / JavaScript"];
const backends = ["No preference", "Node.js + Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel"];
const databases = ["No preference", "MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase", "SQLite"];
const styles = ["No preference", "Tailwind CSS", "CSS Modules", "Styled Components", "Sass", "Vanilla CSS"];

function LocalNote({ children = "Saved on this device only. This setting is not synced to your account." }) {
  return <p className="settings-local-note"><span aria-hidden="true">ⓘ</span>{children}</p>;
}

function Field({ label, value, onChange, placeholder, type = "text", readOnly = false, maxLength }) {
  return (
    <label className="settings-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        maxLength={maxLength}
      />
    </label>
  );
}

function ProfileSection({ settings, update, user, notify }) {
  const avatarInput = useRef(null);
  const profile = settings.profile;
  const initials = user?.name?.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "DF";

  function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      notify("Choose an image file for your avatar.", "error");
      return;
    }
    if (file.size > 1024 * 1024) {
      notify("Choose an image smaller than 1 MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("profile", "avatar", String(reader.result));
    reader.onerror = () => notify("Could not read this image.", "error");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <>
      <SettingsCard title="Your profile" description="Personalize the details shown in your local DevForge workspace." badge="Local only">
        <div className="profile-avatar-editor">
          <div className="profile-avatar-large">
            {profile.avatar ? <img src={profile.avatar} alt="Local profile avatar" /> : initials}
          </div>
          <div className="profile-avatar-actions">
            <strong>Profile photo</strong>
            <span>Stored in this browser only. Image limit: 1 MB.</span>
            <div>
              <button className="button button-secondary button-small" type="button" onClick={() => avatarInput.current?.click()}>Change avatar</button>
              {profile.avatar && <button className="button button-quiet button-small" type="button" onClick={() => update("profile", "avatar", "")}>Remove</button>}
              <input ref={avatarInput} className="visually-hidden" type="file" accept="image/*" onChange={selectAvatar} />
            </div>
          </div>
        </div>
        <div className="settings-form-grid">
          <Field label="Full name" value={user?.name || ""} readOnly />
          <Field label="Email address" value={user?.email || ""} type="email" readOnly />
          <Field label="Username" value={profile.username} onChange={(value) => update("profile", "username", value)} placeholder="Your username" />
          <Field label="Role" value={profile.role} onChange={(value) => update("profile", "role", value)} placeholder="e.g. Full-stack developer" />
          <Field label="Location" value={profile.location} onChange={(value) => update("profile", "location", value)} placeholder="City, country" />
          <Field label="Website / portfolio" value={profile.website} onChange={(value) => update("profile", "website", value)} placeholder="https://" type="url" />
          <Field label="GitHub profile" value={profile.github} onChange={(value) => update("profile", "github", value)} placeholder="https://github.com/you" type="url" />
          <Field label="LinkedIn profile" value={profile.linkedin} onChange={(value) => update("profile", "linkedin", value)} placeholder="https://linkedin.com/in/you" type="url" />
          <label className="settings-field settings-field-full">
            <span>Bio</span>
            <textarea value={profile.bio} onChange={(event) => update("profile", "bio", event.target.value)} placeholder="A short introduction..." rows="3" maxLength="300" />
          </label>
        </div>
        <LocalNote>Name and email are managed by your account. The current backend does not support profile updates; editable details and avatar are only stored in this browser and are not shown as account changes elsewhere.</LocalNote>
      </SettingsCard>
    </>
  );
}

function AccountSection({ user, logout, notify }) {
  return (
    <>
      <SettingsCard title="Account information" description="Details provided by your signed-in account.">
        <div className="settings-data-list">
          <div><span>Name</span><strong>{user?.name || "Unavailable"}</strong></div>
          <div><span>Email address</span><strong>{user?.email || "Unavailable"}</strong></div>
          <div><span>Account status</span><strong><i className="settings-status-dot" /> Active</strong></div>
          <div><span>Created</span><strong className="settings-secondary-value">Not provided by the current API</strong></div>
        </div>
      </SettingsCard>
      <SettingsCard title="Account actions" description="You can log out of this browser. Other account actions need backend support.">
        <SettingRow title="Change email" description="Email changes are not available through the current API."><ComingSoon /></SettingRow>
        <SettingRow title="Change password" description="Password changes are not available through the current API."><ComingSoon /></SettingRow>
        <SettingRow title="Log out from this device" description="Remove your current sign-in from this browser.">
          <button className="button button-secondary button-small" type="button" onClick={() => { notify("You have been logged out."); logout(); }}>Log out</button>
        </SettingRow>
        <SettingRow title="Log out from all sessions" description="The backend does not currently provide session revocation."><ComingSoon /></SettingRow>
      </SettingsCard>
    </>
  );
}

const accentColors = [
  { label: "Violet", value: "#8d7bff" },
  { label: "Blue", value: "#5b9cff" },
  { label: "Teal", value: "#33b9a5" },
  { label: "Green", value: "#53bd7a" },
  { label: "Amber", value: "#d9a441" },
  { label: "Rose", value: "#e47f9b" },
];

function AppearanceSection({ settings, update }) {
  const appearance = settings.appearance;
  return (
    <>
      <SettingsCard title="Theme" description="Choose how DevForge looks on this device. Changes preview immediately.">
        <div className="theme-options">
          {[["dark", "◐", "Dark"], ["light", "☼", "Light"], ["system", "◒", "System"]].map(([value, icon, label]) => (
            <button key={value} type="button" className={`theme-option${appearance.theme === value ? " theme-option-selected" : ""}`} onClick={() => update("appearance", "theme", value)} aria-pressed={appearance.theme === value}>
              <span className="theme-option-icon" aria-hidden="true">{icon}</span><strong>{label}</strong>
            </button>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Accent color" description="Choose a highlight color for buttons and active controls.">
        <div className="accent-options" role="radiogroup" aria-label="Accent color">
          {accentColors.map((color) => (
            <button key={color.value} type="button" className={`accent-swatch${appearance.accent === color.value ? " accent-swatch-selected" : ""}`} style={{ "--swatch-color": color.value }} onClick={() => update("appearance", "accent", color.value)} role="radio" aria-checked={appearance.accent === color.value} aria-label={color.label} title={color.label}>
              {appearance.accent === color.value && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Interface density" description="Adjust spacing throughout the workspace.">
        <div className="density-options">
          {["comfortable", "compact"].map((density) => (
            <button key={density} type="button" className={`density-option${appearance.density === density ? " density-option-selected" : ""}`} onClick={() => update("appearance", "density", density)} aria-pressed={appearance.density === density}>
              <span className={`density-preview density-preview-${density}`} aria-hidden="true"><i /><i /><i /></span>
              <span><strong>{density === "comfortable" ? "Comfortable" : "Compact"}</strong><small>{density === "comfortable" ? "More breathing room" : "More content on screen"}</small></span>
            </button>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Interface preferences" description="Control motion and workspace navigation.">
        <SettingRow title="Show animations" description="Use subtle transitions and loading effects."><Toggle label="Show animations" checked={appearance.animations} onChange={(value) => update("appearance", "animations", value)} /></SettingRow>
        <SettingRow title="Reduce motion" description="Limit motion effects for accessibility."><Toggle label="Reduce motion" checked={appearance.reduceMotion} onChange={(value) => update("appearance", "reduceMotion", value)} /></SettingRow>
        <SettingRow title="Show sidebar labels" description="Display navigation names next to their icons."><Toggle label="Show sidebar labels" checked={appearance.sidebarLabels} onChange={(value) => update("appearance", "sidebarLabels", value)} /></SettingRow>
        <SettingRow title="Remember sidebar state" description="Preference is saved locally; collapsible navigation is not available yet."><Toggle label="Remember sidebar state" checked={appearance.rememberSidebar} onChange={(value) => update("appearance", "rememberSidebar", value)} /></SettingRow>
      </SettingsCard>
      <LocalNote>Appearance preferences are saved to this browser and applied immediately.</LocalNote>
    </>
  );
}

function NotificationsSection({ settings, update }) {
  const groups = [
    ["Project notifications", [["projectCreated", "Project created", "When a new project is added."], ["projectCompleted", "Project completed", "When all tracked project tasks are complete."], ["taskCompleted", "Task completed", "When a task is marked complete."], ["progressUpdates", "Project progress updates", "When project progress changes."]]],
    ["AI notifications", [["aiAnalysis", "AI analysis completed", "When a project analysis preview is ready."], ["aiGeneration", "AI project generation completed", "For future generated project workflows."], ["aiErrors", "AI errors", "For future AI service issues."]]],
    ["System notifications", [["securityAlerts", "Security alerts", "Important account security notices."], ["accountActivity", "Account activity", "Sign-in and account activity updates."], ["productUpdates", "Product updates", "New features and DevForge announcements."]]],
  ];
  return (
    <>
      {groups.map(([title, items]) => (
        <SettingsCard key={title} title={title} description="Preferences are stored locally and do not send notifications yet.">
          {items.map(([key, label, description]) => <SettingRow key={key} title={label} description={description}><Toggle label={label} checked={settings.notifications[key]} onChange={(value) => update("notifications", key, value)} /></SettingRow>)}
        </SettingsCard>
      ))}
      <SettingsCard title="Notification delivery" description="Delivery channels are preferences only; sending services are not configured.">
        <SettingRow title="In-app notifications" description="Show activity in the DevForge workspace."><Toggle label="In-app notifications" checked={settings.notifications.inApp} onChange={(value) => update("notifications", "inApp", value)} /></SettingRow>
        <SettingRow title="Email notifications" description="Email delivery is not available through the current backend."><Toggle label="Email notifications" checked={settings.notifications.email} onChange={(value) => update("notifications", "email", value)} /></SettingRow>
      </SettingsCard>
      <LocalNote>Notification preferences are local-only. The current backend has no notification delivery service.</LocalNote>
    </>
  );
}

function AIPreferencesSection({ settings, update }) {
  const ai = settings.ai;
  const behavior = [
    ["assistance", "AI assistance enabled", "Enable future AI-powered workflows."],
    ["recommendations", "Automatic recommendations", "Suggest improvements while planning."],
    ["technologyRecommendations", "Technology recommendations", "Recommend a technology stack."],
    ["roadmapGeneration", "Automatic roadmap generation", "Create roadmap phases from a project idea."],
    ["taskGeneration", "Automatic task generation", "Suggest implementation tasks."],
    ["codeAssistance", "Code generation assistance", "Enable future code-generation workflows."],
    ["explanations", "AI explanations", "Explain generated plans and technical choices."],
    ["suggestionsBeforeChanges", "Suggestions before major changes", "Ask for suggestions before significant project changes."],
  ];
  return (
    <>
      <SettingsCard title="AI provider" description="Provider selection is a saved preference. No AI provider is connected." badge="Not connected">
        <label className="settings-field settings-narrow-field"><span>Preferred provider</span><SettingsSelect value={ai.provider} options={["DevForge AI", "OpenAI", "Other provider"]} onChange={(value) => update("ai", "provider", value)} ariaLabel="Preferred AI provider" /></label>
        <LocalNote>DevForge AI is not active yet. Selecting an external provider does not send data or connect an account.</LocalNote>
      </SettingsCard>
      <SettingsCard title="AI behavior" description="These options prepare your future project-generation preferences.">
        {behavior.map(([key, title, description]) => <SettingRow key={key} title={title} description={description}><Toggle label={title} checked={ai[key]} onChange={(value) => update("ai", key, value)} /></SettingRow>)}
      </SettingsCard>
      <SettingsCard title="Response style" description="Choose how future AI responses should be written.">
        <div className="radio-card-group">
          {["Concise", "Balanced", "Detailed"].map((style) => (
            <label className={`radio-card${ai.responseStyle === style ? " radio-card-selected" : ""}`} key={style}>
              <input type="radio" name="ai-response-style" value={style} checked={ai.responseStyle === style} onChange={() => update("ai", "responseStyle", style)} />
              <span><strong>{style}</strong><small>{style === "Concise" ? "Short and direct" : style === "Balanced" ? "Context with clarity" : "More depth and examples"}</small></span>
            </label>
          ))}
        </div>
      </SettingsCard>
      <SettingsCard title="Development preferences" description="Saved locally for future project recommendations.">
        <div className="settings-form-grid">
          <label className="settings-field"><span>Preferred frontend</span><SettingsSelect value={ai.frontend} options={frontends} onChange={(value) => update("ai", "frontend", value)} ariaLabel="Preferred frontend technology" /></label>
          <label className="settings-field"><span>Preferred backend</span><SettingsSelect value={ai.backend} options={backends} onChange={(value) => update("ai", "backend", value)} ariaLabel="Preferred backend technology" /></label>
          <label className="settings-field"><span>Preferred database</span><SettingsSelect value={ai.database} options={databases} onChange={(value) => update("ai", "database", value)} ariaLabel="Preferred database" /></label>
          <label className="settings-field"><span>Preferred language</span><SettingsSelect value={ai.language} options={["No preference", "JavaScript", "TypeScript", "Python", "Java", "C#"]} onChange={(value) => update("ai", "language", value)} ariaLabel="Preferred programming language" /></label>
          <label className="settings-field"><span>Styling framework</span><SettingsSelect value={ai.styling} options={styles} onChange={(value) => update("ai", "styling", value)} ariaLabel="Preferred styling framework" /></label>
        </div>
      </SettingsCard>
      <LocalNote>All AI preferences are local-only. No AI provider is currently connected.</LocalNote>
    </>
  );
}

function WorkspaceSection({ settings, update }) {
  const workspace = settings.workspace;
  const projectDefaults = [
    ["projectType", "Default project type", projectTypes],
    ["frontend", "Default frontend", frontends],
    ["backend", "Default backend", backends],
    ["database", "Default database", databases],
    ["styling", "Default styling framework", styles],
  ];
  const behaviors = [
    ["autoRoadmap", "Automatically generate roadmap", "AI roadmap generation is not currently connected."],
    ["autoTasks", "Automatically generate tasks", "AI task generation is not currently connected."],
    ["autoProgress", "Automatically calculate progress", "Uses completion of all project tasks."],
    ["autoSaveDrafts", "Automatically save project drafts", "The project builder currently supports manual local draft saving."],
    ["confirmDeleteProjects", "Confirm before deleting projects", "The project list currently always asks before deletion."],
    ["confirmDeleteTasks", "Confirm before deleting tasks", "Task deletion currently always asks for confirmation."],
  ];
  return (
    <>
      <SettingsCard title="Default project settings" description="Defaults are local preferences; they do not change project creation yet.">
        <div className="settings-form-grid">
          {projectDefaults.map(([key, title, options]) => <label className="settings-field" key={key}><span>{title}</span><SettingsSelect value={workspace[key]} options={options} onChange={(value) => update("workspace", key, value)} ariaLabel={title} /></label>)}
        </div>
      </SettingsCard>
      <SettingsCard title="Project behavior" description="Some options are informational until the project workflow is connected to preferences.">
        {behaviors.map(([key, title, description]) => <SettingRow key={key} title={title} description={description}><Toggle label={title} checked={workspace[key]} onChange={(value) => update("workspace", key, value)} /></SettingRow>)}
      </SettingsCard>
      <SettingsCard title="Default project visibility" description="Visibility is not supported by the current project API." badge="Local preference">
        <div className="radio-card-group">
          {["Private", "Public", "Team"].map((visibility) => (
            <label className={`radio-card${workspace.visibility === visibility ? " radio-card-selected" : ""}`} key={visibility}>
              <input type="radio" name="project-visibility" value={visibility} checked={workspace.visibility === visibility} onChange={() => update("workspace", "visibility", visibility)} />
              <span><strong>{visibility}</strong><small>{visibility === "Private" ? "Only you" : visibility === "Public" ? "Visible to everyone" : "Shared with a team"}</small></span>
            </label>
          ))}
        </div>
        <LocalNote>Visibility is only saved as a preference; it is not sent to or enforced by the backend.</LocalNote>
      </SettingsCard>
    </>
  );
}

function SecuritySection({ settings, update, user, logout, notify }) {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const browser = userAgent.includes("Edg/")
    ? "Microsoft Edge"
    : userAgent.includes("Firefox/")
      ? "Mozilla Firefox"
      : userAgent.includes("Chrome/")
        ? "Google Chrome"
        : userAgent.includes("Safari/")
          ? "Safari"
          : "Web browser";
  const operatingSystem = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS")
      ? "macOS"
      : userAgent.includes("Android")
        ? "Android"
        : userAgent.includes("iPhone") || userAgent.includes("iPad")
          ? "iOS"
          : userAgent.includes("Linux")
            ? "Linux"
            : "device";
  const device = `${browser} on ${operatingSystem}`;
  return (
    <>
      <SettingsCard title="Password & authentication" description="The current API does not support password changes or session management.">
        <SettingRow title="Change password" description="A secure password-change endpoint is required."><ComingSoon /></SettingRow>
      </SettingsCard>
      <SettingsCard title="Active sessions" description="Session details are not available from the current authentication API.">
        <div className="session-card">
          <span className="session-device-icon" aria-hidden="true">▣</span>
          <div><strong>Current session <span className="current-session-pill">This device</span></strong><span>{device}</span><small>Signed in as {user?.email || "current account"} · IP and location are not provided</small></div>
        </div>
        <div className="session-action"><span>Log out all other sessions</span><button className="button button-secondary button-small" type="button" disabled title="Session revocation is not supported by the API">Unavailable</button></div>
      </SettingsCard>
      <SettingsCard title="Security preferences" description="Stored locally only; no security notification service is configured.">
        <SettingRow title="Login notifications" description="Preference for future sign-in alerts."><Toggle label="Login notifications" checked={settings.security.loginNotifications} onChange={(value) => update("security", "loginNotifications", value)} /></SettingRow>
        <SettingRow title="Suspicious login alerts" description="Preference for future security alerts."><Toggle label="Suspicious login alerts" checked={settings.security.suspiciousLoginAlerts} onChange={(value) => update("security", "suspiciousLoginAlerts", value)} /></SettingRow>
      </SettingsCard>
      <div className="settings-inline-action"><button className="button button-secondary" type="button" onClick={() => { notify("You have been logged out of this device."); logout(); }}>Log out from this device</button></div>
    </>
  );
}

function DeveloperSection({ settings, update, environment }) {
  return (
    <>
      <SettingsCard title="Developer tools" description="Developer utilities are planned for a future release.">
        <SettingRow title="Developer mode" description="Local preference only. It does not unlock additional APIs or diagnostics."><Toggle label="Developer mode" checked={settings.developer.developerMode} onChange={(value) => update("developer", "developerMode", value)} /></SettingRow>
      </SettingsCard>
      <SettingsCard title="API access" description="API keys are not supported by the current backend." badge="Coming soon">
        <div className="unsupported-panel"><span className="unsupported-icon" aria-hidden="true">⌘</span><div><strong>No API keys yet</strong><p>When API key management is available, you’ll be able to create, manage, and revoke keys here. No keys are currently stored or generated.</p></div></div>
        <button className="button button-secondary" type="button" disabled>Create API key <ComingSoon /></button>
      </SettingsCard>
      <SettingsCard title="Webhooks" description="Webhook endpoints and delivery are not available yet." badge="Coming soon">
        <div className="settings-empty-inline">Webhook configuration will appear here when the backend supports it.</div>
      </SettingsCard>
      <SettingsCard title="Environment" description="Detected from the current frontend build.">
        <div className="settings-data-list"><div><span>Running environment</span><strong>{environment}</strong></div><div><span>API base URL</span><strong className="settings-secondary-value">Configured by frontend environment</strong></div></div>
        <LocalNote>Secrets and backend environment variables are never displayed here.</LocalNote>
      </SettingsCard>
    </>
  );
}

function DataPrivacySection({ settings, update, onExport, onClearDraft, onReset, onDeleteProjects, exportBusy }) {
  return (
    <>
      <SettingsCard title="Your data" description="Export data currently available through your authenticated account.">
        <SettingRow title="Export my projects" description="Download your projects as a JSON file."><button className="button button-secondary button-small" type="button" onClick={() => onExport("projects")} disabled={exportBusy}>Export JSON</button></SettingRow>
        <SettingRow title="Export my tasks" description="Download project tasks with their project names."><button className="button button-secondary button-small" type="button" onClick={() => onExport("tasks")} disabled={exportBusy}>Export JSON</button></SettingRow>
        <SettingRow title="Export profile data" description="Download the signed-in user details and local profile fields."><button className="button button-secondary button-small" type="button" onClick={() => onExport("profile")} disabled={exportBusy}>Export JSON</button></SettingRow>
      </SettingsCard>
      <SettingsCard title="Data management" description="These actions only affect locally stored DevForge preferences and drafts.">
        <SettingRow title="Clear project-builder draft" description="Remove the locally saved, unsubmitted project draft."><button className="button button-secondary button-small" type="button" onClick={onClearDraft}>Clear draft</button></SettingRow>
        <SettingRow title="Clear cached data" description="Remove local settings and the unsubmitted project-builder draft. Does not affect projects or your sign-in."><button className="button button-secondary button-small" type="button" onClick={onReset}>Clear local data</button></SettingRow>
      </SettingsCard>
      <SettingsCard title="Privacy preferences" description="Saved locally; they do not change backend data handling.">
        <SettingRow title="Allow data usage for product improvement" description="Local preference only; server-side usage settings are unavailable."><Toggle label="Allow product improvement data usage" checked={settings.privacy.dataUsage} onChange={(value) => update("privacy", "dataUsage", value)} /></SettingRow>
        <SettingRow title="Allow project data for AI features" description="No AI service is connected; no project data is sent for AI analysis."><Toggle label="Allow project data for AI features" checked={settings.privacy.aiDataUsage} onChange={(value) => update("privacy", "aiDataUsage", value)} /></SettingRow>
        <SettingRow title="Share anonymous analytics" description="Analytics collection is not configured."><Toggle label="Share anonymous analytics" checked={settings.privacy.analytics} onChange={(value) => update("privacy", "analytics", value)} /></SettingRow>
      </SettingsCard>
      <SettingsCard title="Danger zone" description="Project deletion uses the existing API and cannot be undone." className="settings-danger-card">
        <SettingRow title="Delete all projects" description="Permanently delete every project in your account. Project tasks will be removed with them by the existing service, if supported.">
          <button className="button button-danger button-small" type="button" onClick={onDeleteProjects}>Delete projects</button>
        </SettingRow>
        <SettingRow title="Delete account" description="Account deletion and associated-data cleanup are not supported by the current API."><ComingSoon /></SettingRow>
        <SettingRow title="Reset DevForge preferences" description="Restore local settings to their defaults.">
          <button className="button button-danger-outline button-small" type="button" onClick={onReset}>Reset preferences</button>
        </SettingRow>
      </SettingsCard>
    </>
  );
}

function PreferencesSection({ settings, update }) {
  const preferences = settings.preferences;
  const options = [
    ["language", "Language", ["English"]],
    ["dateFormat", "Date format", ["MMM D, YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]],
    ["timeFormat", "Time format", ["12-hour", "24-hour"]],
    ["timezone", "Timezone", [preferences.timezone, "UTC"]],
    ["landingPage", "Default landing page", ["Dashboard", "My Projects", "Tasks"]],
  ];
  const toggles = [
    ["autoSave", "Auto-save", "Preference only; form auto-save is not connected to all pages."],
    ["confirmBeforeDeleting", "Confirm before deleting", "Deletion flows currently ask for confirmation."],
    ["onboardingTips", "Show onboarding tips", "Display helpful prompts as they become available."],
    ["keyboardShortcuts", "Show keyboard shortcuts", "Keyboard shortcuts are listed below; global shortcuts are not active yet."],
  ];
  return (
    <>
      <SettingsCard title="General preferences" description="These preferences are saved locally in this browser.">
        <div className="settings-form-grid">
          {options.map(([key, label, values]) => <label className="settings-field" key={key}><span>{label}</span><SettingsSelect value={preferences[key]} options={values} onChange={(value) => update("preferences", key, value)} ariaLabel={label} /></label>)}
        </div>
        {toggles.map(([key, title, description]) => <SettingRow key={key} title={title} description={description}><Toggle label={title} checked={preferences[key]} onChange={(value) => update("preferences", key, value)} /></SettingRow>)}
      </SettingsCard>
      <SettingsCard title="Keyboard shortcuts" description="Available shortcuts are a reference only; global shortcut handling is not enabled.">
        <div className="shortcut-list">
          {[["/", "Search"], ["N", "New project"], ["D", "Dashboard"], ["P", "Projects"], ["S", "Settings"], ["Esc", "Close dialog"]].map(([key, action]) => <div key={key}><span>{action}</span><kbd>{key}</kbd></div>)}
        </div>
      </SettingsCard>
    </>
  );
}

function AboutSection({ systemStatus, checkSystem, checking }) {
  const rows = [
    ["Frontend", "Running", "real"],
    ["Backend API", systemStatus.backend, systemStatus.backend === "Online" ? "real" : "pending"],
    ["Database", "Status endpoint unavailable", "placeholder"],
    ["Authentication", "Signed in", "real"],
    ["AI engine", "Preview only · not connected", "placeholder"],
  ];
  return (
    <>
      <SettingsCard title="About DevForge" description="Your workspace for turning software ideas into a development lifecycle.">
        <div className="about-product"><span className="brand-mark">&lt;/&gt;</span><div><strong>DevForge</strong><span>AI-Powered Project Builder</span></div><b>v1.0.0</b></div>
        <div className="about-links">
          {["Documentation", "GitHub", "Feedback", "Report a problem", "Terms", "Privacy"].map((label) => <button key={label} type="button" disabled title="This resource is not configured yet.">{label}<ComingSoon /></button>)}
        </div>
      </SettingsCard>
      <SettingsCard title="System status" description="Status checks are labeled by what the current application can verify.">
        <div className="system-status-list">
          {rows.map(([label, status, kind]) => <div className="system-status-row" key={label}><span>{label}</span><strong className={`system-status-${kind}`}><i />{status}</strong></div>)}
        </div>
        <button className="button button-secondary button-small system-check-button" type="button" onClick={checkSystem} disabled={checking}>{checking ? "Checking..." : "Check backend"}</button>
        <LocalNote>Database has no separate status endpoint. Backend availability is checked through the existing API root; AI is not connected.</LocalNote>
      </SettingsCard>
    </>
  );
}

export const settingsSections = [
  { id: "profile", label: "Profile", icon: "◎", description: "Your public-facing profile and personal details." },
  { id: "account", label: "Account", icon: "◉", description: "Your DevForge account information and actions." },
  { id: "appearance", label: "Appearance", icon: "◐", description: "Theme, color, and workspace layout." },
  { id: "notifications", label: "Notifications", icon: "♧", description: "Choose which updates you want to receive." },
  { id: "ai", label: "AI Preferences", icon: "✧", description: "Prepare how DevForge AI should work for you." },
  { id: "workspace", label: "Workspace", icon: "▦", description: "Set project defaults and behavior." },
  { id: "security", label: "Security", icon: "◇", description: "Review sign-in and security options." },
  { id: "developer", label: "Developer / API", icon: "⌘", description: "API access and developer tools." },
  { id: "privacy", label: "Data & Privacy", icon: "▤", description: "Export your data and manage local preferences." },
  { id: "preferences", label: "Preferences", icon: "☷", description: "Language, dates, and everyday behavior." },
  { id: "about", label: "About / System", icon: "ⓘ", description: "DevForge information and system availability." },
];

export function SettingsSectionContent({ section, settings, update, user, logout, notify, actions }) {
  switch (section) {
    case "profile": return <ProfileSection settings={settings} update={update} user={user} notify={notify} />;
    case "account": return <AccountSection user={user} logout={logout} notify={notify} />;
    case "appearance": return <AppearanceSection settings={settings} update={update} />;
    case "notifications": return <NotificationsSection settings={settings} update={update} />;
    case "ai": return <AIPreferencesSection settings={settings} update={update} />;
    case "workspace": return <WorkspaceSection settings={settings} update={update} />;
    case "security": return <SecuritySection settings={settings} update={update} user={user} logout={logout} notify={notify} />;
    case "developer": return <DeveloperSection settings={settings} update={update} environment={actions.environment} />;
    case "privacy": return <DataPrivacySection settings={settings} update={update} {...actions} />;
    case "preferences": return <PreferencesSection settings={settings} update={update} />;
    case "about": return <AboutSection systemStatus={actions.systemStatus} checkSystem={actions.checkSystem} checking={actions.checkingSystem} />;
    default: return null;
  }
}
