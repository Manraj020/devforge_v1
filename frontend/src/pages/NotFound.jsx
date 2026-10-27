import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <span className="not-found-code">404</span>
      <h1>This page is off the roadmap.</h1>
      <p className="page-subtitle">The page you’re looking for doesn’t exist.</p>
      <Link className="button button-primary" to="/">Back to dashboard</Link>
    </main>
  );
}
