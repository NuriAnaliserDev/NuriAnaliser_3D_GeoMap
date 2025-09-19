// frontend/src/api.js
import axios from "axios";

const API = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const createProject = (data) => API.post("/api/projects", data);
export const listProjects = () => API.get("/api/projects");
export const sendThreePoint = (data) => API.post("/api/analyze/three-point", data);
export const getResults = () => API.get("/api/results");
export const exportResults = () => API.get("/api/results/export", { responseType: "blob" });
