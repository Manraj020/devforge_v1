export default function SelectionCard({
  icon,
  title,
  description,
  selected,
  onClick,
  featured = false,
}) {
  return (
    <button
      className={`selection-card${selected ? " selection-card-selected" : ""}${featured ? " selection-card-featured" : ""}`}
      type="button"
      onClick={onClick}
      aria-pressed={selected}
    >
      <span className="selection-card-icon" aria-hidden="true">{icon}</span>
      <span className="selection-card-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className="selection-check" aria-hidden="true">{selected ? "✓" : ""}</span>
    </button>
  );
}
