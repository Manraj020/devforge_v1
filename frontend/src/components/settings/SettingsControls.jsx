export function SettingsCard({ title, description, badge, children, className = "" }) {
  return (
    <section className={`settings-card ${className}`.trim()}>
      <div className="settings-card-heading">
        <div><h3>{title}</h3>{description && <p>{description}</p>}</div>
        {badge && <span className="settings-badge">{badge}</span>}
      </div>
      {children}
    </section>
  );
}

export function SettingRow({ title, description, children, className = "" }) {
  return (
    <div className={`setting-row ${className}`.trim()}>
      <div className="setting-row-copy"><strong>{title}</strong>{description && <span>{description}</span>}</div>
      <div className="setting-row-control">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      className={`setting-toggle${checked ? " setting-toggle-on" : ""}`}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span />
    </button>
  );
}

export function SettingsSelect({ value, options, onChange, disabled = false, ariaLabel }) {
  return (
    <select
      className="settings-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const [optionValue, label] = Array.isArray(option) ? option : [option, option];
        return <option value={optionValue} key={optionValue}>{label}</option>;
      })}
    </select>
  );
}

export function ComingSoon({ children = "Coming soon" }) {
  return <span className="coming-soon settings-coming-soon">{children}</span>;
}

export function SaveBar({ dirty, onSave, onCancel }) {
  if (!dirty) return null;
  return (
    <div className="settings-save-bar" role="status">
      <span>You have unsaved changes</span>
      <div>
        <button className="button button-secondary button-small" type="button" onClick={onCancel}>Cancel</button>
        <button className="button button-primary button-small" type="button" onClick={onSave}>Save changes</button>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, description, confirmationText, value, onChange, onCancel, onConfirm, busy, confirmLabel = "Confirm" }) {
  return (
    <div className="settings-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section className="settings-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <span className="danger-modal-icon" aria-hidden="true">!</span>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        {confirmationText && (
          <label className="settings-field">
            <span>Type <strong>{confirmationText}</strong> to confirm</span>
            <input autoFocus value={value} onChange={(event) => onChange(event.target.value)} />
          </label>
        )}
        <div className="settings-modal-actions">
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="button button-danger" type="button" onClick={onConfirm} disabled={busy || (confirmationText && value !== confirmationText)}>
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
