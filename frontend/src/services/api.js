import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("devforge-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (details) => api.post("/auth/register", details),
};

export const projectApi = {
  list: () => api.get("/projects"),
  get: (id) => api.get(`/projects/${id}`),
  create: (project) => api.post("/projects", project),
  update: (id, changes) => api.put(`/projects/${id}`, changes),
  remove: (id) => api.delete(`/projects/${id}`),
};

export const taskApi = {
  listForProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  create: (task) => api.post("/tasks", task),
  update: (id, changes) => api.put(`/tasks/${id}`, changes),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export const systemApi = {
  checkBackend: () => api.get("/", {
    baseURL: `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/`,
  }),
};

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error.response?.data?.message || error.message || fallback;
}

export default api;
