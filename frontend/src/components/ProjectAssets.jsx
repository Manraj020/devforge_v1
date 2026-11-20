import { useRef, useState } from "react";
import { assetApi, getAssetUrl, getErrorMessage } from "../services/api";
import { ErrorMessage } from "./Feedback";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PREVIEWABLE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

function formatSize(bytes) {
  if (!Number.isFinite(Number(bytes)) || Number(bytes) < 0) return "Unknown size";
  const size = Number(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "Date unavailable";
  const value = new Date(date);
  return Number.isNaN(value.getTime())
    ? "Date unavailable"
    : value.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fileKind(mimetype = "") {
  if (mimetype.startsWith("image/")) return "IMG";
  if (mimetype.includes("pdf")) return "PDF";
  if (mimetype.includes("spreadsheet") || mimetype.includes("excel")) return "XLS";
  if (mimetype.includes("word") || mimetype.includes("document")) return "DOC";
  if (mimetype.startsWith("text/") || mimetype.includes("json")) return "TXT";
  if (mimetype.startsWith("video/")) return "VID";
  if (mimetype.startsWith("audio/")) return "AUD";
  return "FILE";
}

function AssetCard({ asset }) {
  const url = getAssetUrl(asset.path);
  const showPreview = PREVIEWABLE_IMAGE_TYPES.has(asset.mimetype);

  return (
    <article className="asset-card">
      <a className="asset-preview" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${asset.originalName}`}>
        {showPreview ? (
          <img src={url} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
        ) : (
          <span className={`asset-file-icon asset-kind-${fileKind(asset.mimetype).toLowerCase()}`} aria-hidden="true">
            {fileKind(asset.mimetype)}
          </span>
        )}
      </a>
      <div className="asset-card-content">
        <strong className="asset-name" title={asset.originalName}>{asset.originalName}</strong>
        <div className="asset-meta">
          <span>{asset.mimetype || "Unknown type"}</span>
          <i aria-hidden="true" />
          <span>{formatSize(asset.size)}</span>
        </div>
        <span className="asset-upload-date">Uploaded {formatDate(asset.uploadedAt)}</span>
        <a className="asset-open-link" href={url} target="_blank" rel="noreferrer" download={asset.originalName}>
          {showPreview ? "Open image" : "Download file"} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default function ProjectAssets({ projectId, assets = [], onUploaded }) {
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function uploadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setUploadProgress(0);

    if (file.size > MAX_FILE_SIZE) {
      setError("This file is larger than the 5 MB upload limit.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const { data } = await assetApi.upload(projectId, file, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        }
      });
      onUploaded(data.asset);
      setSuccess(`${file.name} uploaded successfully.`);
      setUploadProgress(100);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not upload this asset."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <section className="panel project-assets-panel" aria-labelledby="project-assets-heading">
      <div className="section-heading section-heading-tight assets-section-heading">
        <div>
          <p className="eyebrow">PROJECT FILES</p>
          <h2 id="project-assets-heading">Project Assets <span className="count-badge">{assets.length}</span></h2>
          <p>Upload and manage files related to this project.</p>
        </div>
        <button className="button button-primary" type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : <><span aria-hidden="true">↑</span> Upload Asset</>}
        </button>
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          onChange={uploadFile}
          disabled={uploading}
          aria-label="Select a project asset"
        />
      </div>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <div className="alert alert-success asset-success" role="status">{success}</div>}
      {uploading && (
        <div className="asset-upload-status" role="status" aria-live="polite">
          <div className="asset-upload-status-top"><span>Uploading file...</span><strong>{uploadProgress}%</strong></div>
          <div className="progress-track" role="progressbar" aria-label="File upload progress" aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
            <span className="progress-value" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {assets.length === 0 ? (
        <div className="assets-empty-state">
          <span className="assets-empty-icon" aria-hidden="true">⇧</span>
          <h3>No project assets yet.</h3>
          <p>Keep useful images and files together with this project. Uploads are limited to 5 MB each.</p>
          <button className="button button-secondary" type="button" onClick={() => fileInput.current?.click()} disabled={uploading}>
            Upload Your First Asset
          </button>
        </div>
      ) : (
        <div className="assets-grid">
          {assets.map((asset) => <AssetCard key={asset._id || asset.filename} asset={asset} />)}
        </div>
      )}
    </section>
  );
}
