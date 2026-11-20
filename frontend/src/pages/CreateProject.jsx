import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorMessage } from "../components/Feedback";
import AnalysisPreview from "../components/project-builder/AnalysisPreview";
import FeatureSelectionStep from "../components/project-builder/FeatureSelectionStep";
import ProjectIdeaStep from "../components/project-builder/ProjectIdeaStep";
import ProjectReview from "../components/project-builder/ProjectReview";
import ProjectTypeStep from "../components/project-builder/ProjectTypeStep";
import StepIndicator from "../components/project-builder/StepIndicator";
import TechnologyStep from "../components/project-builder/TechnologyStep";
import { analyzeProject } from "../services/projectAnalysis";
import { getErrorMessage, projectApi, taskApi } from "../services/api";

const DRAFT_KEY = "devforge-project-wizard-draft";
const initialForm = {
  idea: "",
  name: "",
  projectType: "",
  frontend: "",
  backend: "",
  database: "",
  features: [],
  customFeatures: [],
};

function readDraft() {
  try {
    const storedDraft = localStorage.getItem(DRAFT_KEY);
    if (!storedDraft) return { form: initialForm, step: 1, restored: false };

    const draft = JSON.parse(storedDraft);
    const savedForm = draft.form || draft;
    return {
      form: {
        ...initialForm,
        ...savedForm,
        features: Array.isArray(savedForm.features) ? savedForm.features : [],
        customFeatures: Array.isArray(savedForm.customFeatures) ? savedForm.customFeatures : [],
      },
      step: Number.isInteger(draft.step) && draft.step >= 1 && draft.step <= 5 ? draft.step : 1,
      restored: true,
    };
  } catch {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      return { form: initialForm, step: 1, restored: false };
    }
    return { form: initialForm, step: 1, restored: false };
  }
}

export default function CreateProject() {
  const [initialDraft] = useState(readDraft);
  const [form, setForm] = useState(initialDraft.form);
  const [step, setStep] = useState(initialDraft.step);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [draftRestored] = useState(initialDraft.restored);
  const navigate = useNavigate();

  function updateForm(updater) {
    setForm((current) => typeof updater === "function" ? updater(current) : { ...current, ...updater });
    setAnalysis(null);
    setError("");
    setNotice("");
  }

  function updateField(field, value) {
    updateForm((current) => ({ ...current, [field]: value }));
  }

  function continueStep() {
    setError("");
    if (step === 1 && !form.idea.trim()) {
      setError("Describe your project idea before continuing.");
      return;
    }
    if (step === 2 && !form.projectType) {
      setError("Choose a project type before continuing.");
      return;
    }
    setStep((current) => Math.min(5, current + 1));
  }

  function saveDraft() {
    setError("");
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
      setNotice("Draft saved on this device. It has not been added to your projects yet.");
    } catch (saveError) {
      setError(getErrorMessage(saveError, "Could not save this draft in your browser."));
    }
  }

  async function runAnalysis() {
    setError("");
    setNotice("");
    setAnalysis(null);
    setAnalyzing(true);
    try {
      const result = await analyzeProject(form);
      setAnalysis(result);
    } catch (analysisError) {
      setError(getErrorMessage(analysisError, "Could not prepare the analysis preview."));
    } finally {
      setAnalyzing(false);
    }
  }

  async function createProject() {
    setError("");
    setNotice("");
    if (!form.name.trim()) {
      setError("Add a project name before creating your project.");
      return;
    }
    if (!form.idea.trim() || !form.projectType) {
      setError("Add a project idea and choose a project type before creating your project.");
      return;
    }

    setCreating(true);
    try {
      const selectedFeatures = [...new Set([...form.features, ...form.customFeatures])];
      const { data } = await projectApi.create({
        name: form.name.trim(),
        description: form.idea.trim(),
        type: form.projectType,
        frontend: form.frontend ? [form.frontend] : [],
        backend: form.backend ? [form.backend] : [],
        database: form.database ? [form.database] : [],
        features: selectedFeatures,
      });

      const taskResults = await Promise.allSettled(
        selectedFeatures.map((feature) => taskApi.create({
          title: feature,
          category: "Features",
          completed: false,
          projectId: data.project._id,
        })),
      );
      const failedTaskCount = taskResults.filter((result) => result.status === "rejected").length;
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/projects/${data.project._id}`, {
        replace: true,
        state: {
          message: "Project created successfully.",
          warning: failedTaskCount
            ? `Project created, but ${failedTaskCount} feature task${failedTaskCount === 1 ? "" : "s"} could not be created.`
            : "",
        },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not create this project."));
    } finally {
      setCreating(false);
    }
  }

  function toggleFeature(feature) {
    updateForm((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  }

  function addCustomFeature(feature) {
    updateForm((current) => current.customFeatures.some((item) => item.toLowerCase() === feature.toLowerCase())
      ? current
      : { ...current, customFeatures: [...current.customFeatures, feature] });
  }

  function removeCustomFeature(feature) {
    updateForm((current) => ({
      ...current,
      customFeatures: current.customFeatures.filter((item) => item !== feature),
    }));
  }

  return (
    <>
      <div className="breadcrumb"><Link to="/projects">My Projects</Link><span>/</span><span>Project builder</span></div>
      <section className="form-page-heading wizard-page-heading">
        <p className="eyebrow">DEVFORGE PROJECT BUILDER</p>
        <h1>Turn your idea into a build plan.</h1>
        <p className="page-subtitle">A few thoughtful choices now make it easier to build with direction later.</p>
      </section>

      <div className="wizard-container">
        <StepIndicator currentStep={step} onSelect={setStep} />
        <div className="panel wizard-panel">
          {draftRestored && <div className="draft-restored"><span aria-hidden="true">↻</span> Your saved draft was restored from this device.</div>}
          {notice && <div className="alert alert-success wizard-alert" role="status">{notice}</div>}
          <ErrorMessage>{error}</ErrorMessage>

          {step === 1 && <ProjectIdeaStep idea={form.idea} onChange={(idea) => updateField("idea", idea)} />}
          {step === 2 && <ProjectTypeStep value={form.projectType} onChange={(projectType) => updateField("projectType", projectType)} />}
          {step === 3 && (
            <TechnologyStep
              selections={form}
              onChange={(field, value) => updateField(field, value)}
            />
          )}
          {step === 4 && (
            <FeatureSelectionStep
              features={form.features}
              customFeatures={form.customFeatures}
              onToggle={toggleFeature}
              onAddCustom={addCustomFeature}
              onRemoveCustom={removeCustomFeature}
            />
          )}
          {step === 5 && (
            <>
              <ProjectReview form={form} onNameChange={(name) => updateField("name", name)} />
              {analyzing && (
                <div className="analysis-loading" role="status">
                  <span className="spinner" />
                  <div><strong>Preparing your preview...</strong><span>Organizing the choices you made in this wizard.</span></div>
                </div>
              )}
              {analysis && <AnalysisPreview analysis={analysis} />}
            </>
          )}

          <div className="wizard-footer">
            <div className="wizard-footer-left">
              {step > 1 ? (
                <button className="button button-secondary" type="button" onClick={() => setStep((current) => current - 1)}>
                  <span aria-hidden="true">←</span> Back
                </button>
              ) : <Link className="button button-secondary" to="/projects">Cancel</Link>}
              <button className="button button-quiet wizard-save-button" type="button" onClick={saveDraft}>
                Save draft
              </button>
            </div>
            {step < 5 ? (
              <button className="button button-primary" type="button" onClick={continueStep}>
                Continue <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={runAnalysis} disabled={analyzing || creating}>
                {analyzing ? "Preparing preview..." : "✨ Analyze My Project"}
              </button>
            )}
          </div>

          {step === 5 && analysis && (
            <div className="wizard-create-footer">
              <div>
                <strong>Ready to make it official?</strong>
                <span>Your project will be created in your DevForge workspace.</span>
              </div>
              <button className="button button-primary create-project-button" type="button" onClick={createProject} disabled={creating || analyzing}>
                {creating ? "Creating project..." : "🚀 Create Project"}
              </button>
            </div>
          )}
        </div>
        <p className="wizard-footnote"><span aria-hidden="true">✧</span> Analysis is a local preview only. No AI service is connected yet.</p>
      </div>
    </>
  );
}
