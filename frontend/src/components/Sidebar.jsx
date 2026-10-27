import { NavLink } from "react-router-dom";

const navigation = [
  { to: "/", label: "Dashboard", icon: "⌂", end: true },
  { to: "/projects", label: "My Projects", icon: "▦" },
  { to: "/projects/new", label: "Create Project", icon: "+" },
  { to: "/tasks", label: "Tasks", icon: "✓" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/" aria-label="DevForge dashboard">
        <span className="brand-mark">&lt;/&gt;</span>
        <span>devforge</span>
      </NavLink>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-item${isActive ? " nav-item-active" : ""}`}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <span className="online-dot" />
        <span>Workspace ready</span>
        <span className="sidebar-version">v1</span>
      </div>
    </aside>
  );
}
