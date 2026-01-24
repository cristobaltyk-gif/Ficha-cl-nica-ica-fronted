import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===============================
   HOME EXISTENTE
   =============================== */
import HomeSecretaria from "../pages/home/HomeSecretaria";

/* ===============================
   MÓDULOS EXISTENTES
   =============================== */
import DashboardAgenda from "../pages/dashboard-agenda.jsx";
import DashboardPacientes from "../pages/dashboard-pacientes.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import DashboardDocumentos from "../pages/dashboard-documentos.jsx";
import DashboardAdministracion from "../pages/dashboard-administracion.jsx";

/* ===============================
   ROL ACTIVO
   =============================== */
import secretaria from "../roles/secretaria";

/* ===============================
   ROLE GUARD
   =============================== */
function RoleGuard({ role, route, children }) {
  if (!role.allow.includes(route)) {
    return <Navigate to={role.entry} replace />;
  }
  return children;
}

/* ===============================
   ROUTER PRINCIPAL
   =============================== */
export default function AppRouter() {
  const activeRole = secretaria; // luego vendrá desde sesión

  return (
    <BrowserRouter>
      <Routes>
        {/* Entrada */}
        <Route
          path="/"
          element={<Navigate to={activeRole.entry} replace />}
        />

        {/* HOME SECRETARÍA */}
        <Route
          path="/secretaria"
          element={<HomeSecretaria />}
        />

        {/* AGENDA */}
        <Route
          path="/agenda"
          element={
            <RoleGuard role={activeRole} route="agenda">
              <DashboardAgenda />
            </RoleGuard>
          }
        />

        {/* PACIENTES */}
        <Route
          path="/pacientes"
          element={
            <RoleGuard role={activeRole} route="pacientes">
              <DashboardPacientes />
            </RoleGuard>
          }
        />

        {/* ATENCIÓN */}
        <Route
          path="/atencion"
          element={
