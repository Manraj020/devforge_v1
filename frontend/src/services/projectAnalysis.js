function buildRequirements(form) {
  const featureRequirements = [...form.features, ...form.customFeatures].map(
    (feature) => `Define the scope and acceptance criteria for ${feature}.`,
  );
  const ideaRequirement = form.idea.trim()
    ? `Clarify the primary users and key outcome described in: “${form.idea.trim()}”`
    : "Clarify the primary users and the core outcome of this project.";

  return featureRequirements.length
    ? [ideaRequirement, ...featureRequirements]
    : [ideaRequirement, "Break the project's core capabilities into clear requirements."];
}

export async function analyzeProject(form) {
  await new Promise((resolve) => window.setTimeout(resolve, 900));

  return {
    requirements: buildRequirements(form),
    stack: [
      ["Frontend", form.frontend],
      ["Backend", form.backend],
      ["Database", form.database],
    ],
    architecture: {
      frontend: form.frontend || "Not selected",
      backend: form.backend || (form.projectType === "API / Backend" ? "API service" : "Not selected"),
      database: form.database || "Not selected",
    },
  };
}
