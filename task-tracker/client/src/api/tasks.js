const BASE = "/api/tasks";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  getTasks: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request(`${BASE}${qs ? `?${qs}` : ""}`);
  },

  getStats: () => request(`${BASE}/stats`),

  createTask: (body) =>
    request(BASE, { method: "POST", body: JSON.stringify(body) }),

  updateTask: (id, body) =>
    request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  updateStatus: (id, status) =>
    request(`${BASE}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteTask: (id) => request(`${BASE}/${id}`, { method: "DELETE" }),
};
