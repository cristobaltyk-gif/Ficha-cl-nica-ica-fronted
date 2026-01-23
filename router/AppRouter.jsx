import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Dashboards estructurales (YA EXISTEN)
import DashboardAgenda from "../dashboards/DashboardAgenda";
import DashboardPacientes from "../dashboards/DashboardPacientes";
import DashboardAtencion from "../dashboards/DashboardAtencion";
import DashboardDocumentos from "../dashboards/DashboardDocumentos";
import DashboardAdministracion from "../dashboards/DashboardAdministracion";

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
  // 🔒 Rol activo (más adelante viene de sesión/login)
  const activeRole = secretaria;

  return (
    <BrowserRouter>
      <Routes>
        {/* Entrada por defecto según rol */}
        <Route path="/" element={<Navigate to={activeRole.entry} replace />} />

        {/* ===== AGENDA ===== */}
        <Route
          path="/agenda"
          element={
            <RoleGuard role={activeRole} route="agenda">
              <DashboardAgenda />
            </RoleGuard>
          }
        />

        {/* ===== PACIENTES ===== */}
        <Route
          path="/pacientes"
          element={
            <RoleGuard role={activeRole} route="pacientes">
              <DashboardPacientes />
            </RoleGuard>
          }
        />

        {/* ===== ATENCIÓN CLÍNICA ===== */}
        <Route
          path="/atencion"
          element={
            <RoleGuard role={activeRole} route="atencion">
              <DashboardAtencion />
            </RoleGuard>
          }
        />

        {/* ===== DOCUMENTOS ===== */}
        <Route
          path="/documentos"
          element={
            <RoleGuard role={activeRole} route="documentos">
              <DashboardDocumentos />
            </RoleGuard>
          }
        />

        {/* ===== ADMINISTRACIÓN ===== */}
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
