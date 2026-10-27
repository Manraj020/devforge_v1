import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage } from "../components/Feedback";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [notice] = useState(location.state?.message || "");

  if (isAuthenticated) return <Navigate to="/" replace />;

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to sign in."));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" to="/">
          <span className="brand-mark">&lt;/&gt;</span><span>devforge</span>
        </Link>
        <p className="eyebrow">YOUR BUILD SPACE</p>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue building with direction.</p>
        {notice && <div className="alert alert-success" role="status">{notice}</div>}
        <ErrorMessage>{error}</ErrorMessage>
        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              type="password"
              name="password"
              value={form.password}
              onChange={update}
              placeholder="Enter your password"
              required
            />
          </label>
          <button className="button button-primary button-full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">New to DevForge? <Link to="/signup">Create an account</Link></p>
      </section>
    </main>
  );
}
