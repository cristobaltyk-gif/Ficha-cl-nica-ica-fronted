// roles/admin.js
export default {
  id: "admin",
  entry: "/admin",
  allow: [
    "agenda",
    "pacientes",
    "medicos",
    "secretarias",
    "usuarios",
    "informes",
    "administracion",
    "configuracion"
  ]
};
