// roles/medico.js
export default {
  id: "medico",
  entry: "/medico",                  // 🔑 HOME del rol
  allow: [
    "agenda",        // usa la MISMA agenda (menús distintos)
    "atencion",      // dashboard atención clínica
    "pacientes",     // búsqueda / historial
    "informes",      // informes médicos
    "configuracion"  // perfil, firma, ajustes
  ]
};
