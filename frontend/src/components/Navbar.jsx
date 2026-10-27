import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const initials = user?.name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="topbar">
      <Link className="brand mobile-brand" to="/" aria-label="DevForge dashboard">
        <span className="brand-mark">&lt;/&gt;</span>
        <span>devforge</span>
      </Link>
      <div className="topbar-spacer" />
      <div className="profile-menu">
        <span className="avatar" aria-hidden="true">{initials || "DF"}</span>
        <span className="profile-name">{user?.name || "Developer"}</span>
        <button type="button" className="button button-quiet button-small" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
