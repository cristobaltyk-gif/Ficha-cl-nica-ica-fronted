// roles/admin.js
export default {
  id: "admin",
  entry: "/administracion",          // 🔑 HOME del administrador
  allow: [
    "agenda",        // ve agenda global (solo lectura o total según definas)
    "pacientes",     // acceso total
    "medicos",       // alta / baja / edición médicos
    "secretarias",   // gestión de secretarias
    "usuarios",      // cuentas y permisos
    "informes",      // informes globales
    "administracion",// panel principal admin
    "configuracion"  // parámetros del sistema
  ]
};
