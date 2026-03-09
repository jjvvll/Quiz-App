import axios from "axios";

const isLocal = window.location.hostname === "localhost";

const api = axios.create({
  baseURL: isLocal
    ? "http://localhost:8000" // PC
    : "http://192.168.1.8:8000", // phone
  withCredentials: true,
  withXSRFToken: true,
  timeout: 600000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export default api;
