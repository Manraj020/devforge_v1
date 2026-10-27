import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ErrorMessage } from "../components/Feedback";
import { getErrorMessage } from "../services/api";

export default function Signup() {
  const { signup, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const { message } = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess(message || "Account created. You can now sign in.");
      navigate("/login", { replace: true, state: { message: message || "Account created successfully." } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to create your account."));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="brand auth-brand" to="/">
          <span className="brand-mark">&lt;/&gt;</span><span>devforge</span>
        </Link>
        <p className="eyebrow">START BUILDING</p>
        <h1>Create your account</h1>
        <p className="auth-subtitle">A focused workspace for your next big idea.</p>
        {success && <div className="alert alert-success">{success}</div>}
        <ErrorMessage>{error}</ErrorMessage>
        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            <span>Name</span>
            <input autoComplete="name" name="name" value={form.name} onChange={update} placeholder="Your name" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input autoComplete="email" type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete="new-password" type="password" name="password" minLength="6" value={form.password} onChange={update} placeholder="At least 6 characters" required />
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input autoComplete="new-password" type="password" name="confirmPassword" value={form.confirmPassword} onChange={update} placeholder="Repeat your password" required />
          </label>
          <button className="button button-primary button-full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </section>
    </main>
  );
}
