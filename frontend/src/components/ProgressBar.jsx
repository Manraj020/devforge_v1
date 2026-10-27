export default function ProgressBar({ value = 0, compact = false }) {
  const progress = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      className={`progress-track${compact ? " progress-track-compact" : ""}`}
      role="progressbar"
      aria-label="Overall project progress"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span className="progress-value" style={{ width: `${progress}%` }} />
    </div>
  );
}
