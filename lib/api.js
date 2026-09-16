const API_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export const api = {
  getUsers: () => request("/users"),

  createUser: (payload) =>
    request("/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (payload) =>
    request("/users/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTasks: (params = "") => request(`/tasks${params}`),

  createTask: (payload) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateTask: (id, payload) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE",
    }),

  completeTask: (id) =>
    request(`/tasks/${id}/complete`, {
      method: "POST",
    }),
};
