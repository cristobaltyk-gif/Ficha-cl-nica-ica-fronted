// utils/api.js
// Helper centralizado para todos los fetch del proyecto.
// Agrega automáticamente X-Internal-User desde sessionStorage.

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const session = sessionStorage.getItem("session");
  const usuario = session ? JSON.parse(session).usuario : null;

  const headers = {
    ...(options.headers || {}),
    ...(usuario ? { "X-Internal-User": usuario } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return res;
}
