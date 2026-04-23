// utils/api.js
// Helper centralizado para todos los fetch del proyecto.
// Agrega automáticamente el token JWT desde localStorage.

const API_URL = import.meta.env.VITE_API_URL;

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return res;
}
