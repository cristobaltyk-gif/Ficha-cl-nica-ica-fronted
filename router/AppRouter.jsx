import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Dashboards reales (ubicación y nombres EXACTOS)
import DashboardAgenda from "../pages/dashboard-agenda.jsx";
import DashboardPacientes from "../pages/dashboard-pacientes.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import DashboardDocumentos from "../pages/dashboard-documentos.jsx";
import DashboardAdministracion from "../pages/dashboard-administracion.jsx";

// Rol activo (frontend)
import secretaria from "../roles/secretaria";

/**
 * Guard de rol
 * Orquesta acceso a pantallas (FRONTEND PURO)
 */
function RoleGuard({ role, route, children }) {
  if (!role.allow.includes(route)) {
    return <Navigate to={role.entry} replace />;
  }
  return children;
}

export default function AppRouter() {
  // Rol activo (por ahora fijo, luego viene desde sesión)
  const activeRole = secretaria;

  return (
    <BrowserRouter>
      <Routes>
        {/* Entrada por defecto */}
        <Route path="/" element={<Navigate to={activeRole.entry} replace />} />

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
            <RoleGuard role={activeRole} route="atencion">
              <DashboardAtencion />
            </RoleGuard>
          }
        />

        {/* DOCUMENTOS */}
        <Route
          path="/documentos"
          element={
            <RoleGuard role={activeRole} route="documentos">
              <DashboardDocumentos />
            </RoleGuard>
          }
        />

        {/* ADMINISTRACIÓN */}
        <Route
          path="/administracion"
          element={
            <RoleGuard role={activeRole} route="administracion">
              <DashboardAdministracion />
            </RoleGuard>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={activeRole.entry} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
