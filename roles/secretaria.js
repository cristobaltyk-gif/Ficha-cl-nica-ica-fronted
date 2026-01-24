// roles/secretaria.js
export default {
  id: "secretaria",
  entry: "/secretaria",              // 🔑 HOME del rol
  allow: ["agenda", "pacientes", "medicos", "administracion"]
};
