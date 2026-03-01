import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Use relative path for Nginx proxy
});

export default api;
