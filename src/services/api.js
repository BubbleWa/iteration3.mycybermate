import axios from "axios";

// === Create axios instance ===
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://cybermate-production.up.railway.app",
  timeout: 10000, // 10s
});

// === Response interceptor ===
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Network error – please try again.";
    return Promise.reject(new Error(message));
  }
);

//
// ---------- General ----------
//
export async function detectScamBot(text) {
  const res = await api.post("/detect", { text });
  return res.data;
}

export async function detectRisk(text) {
  const res = await api.post("/risk/risk_detect", { text });
  return res.data;
}

//
// ---------- Epic 6: Company Validation ----------
//
export async function epic6CheckAcn(acn) {
  const res = await api.get("/epic6/check_acn", { params: { acn } });
  return res.data;
}

export async function epic6CheckName(name, limit = 10) {
  const res = await api.get("/epic6/check_name", { params: { name, limit } });
  return res.data;
}

export async function epic6Stats() {
  const res = await api.get("/epic6/stat"); // ✅ final version
  return res.data;
}


// ✅ ---------- Epic 7: Safe Investment Hub ----------
export async function epic7Prevention(category) {
  // e.g. /epic7/prevention/Crypto
  const res = await api.get(`/epic7/prevention/${encodeURIComponent(category)}`);
  return res.data;
}

export async function epic7LinkCheck(url) {
  // e.g. /epic7/link-check?url=https://example.com
  const res = await api.get("/epic7/link-check", { params: { url } });
  return res.data;
}

export async function epic7Stats() {
  const res = await api.get("/epic7/stats");
  return res.data;
}

export default api;
