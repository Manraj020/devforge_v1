export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="state-panel" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ children }) {
  if (!children) return null;
  return <div className="alert alert-error" role="alert">{children}</div>;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">&lt;/&gt;</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
