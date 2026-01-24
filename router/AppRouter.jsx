import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===============================
   HOME SECRETARÍA
   =============================== */
import HomeSecretaria from "../pages/home/HomeSecretaria";

/* ===============================
   DASHBOARDS
   =============================== */
import DashboardAgenda from "../pages/dashboard-agenda.jsx";
import DashboardPacientes from "../pages/dashboard-pacientes.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import DashboardDocumentos from "../pages/dashboard-documentos.jsx";
import DashboardAdministracion from "../pages/dashboard-administracion.jsx";

/* ===============================
   ROL
   =============================== */
import secretaria from "../roles/secretaria";

/* ===============================
   ROLE GUARD
   =============================== */
function RoleGuard({ role, route, children }) {
  if (!role || !role.allow.includes(route)) {
    return <Navigate to={role.entry} replace />;
  }
  return children;
}

/* ===============================
   ROUTER PRINCIPAL
   =============================== */
export default function AppRouter() {
  const activeRole = secretaria;

  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT → HOME SECRETARIA */}
        <Route
          path="/"
          element={<Navigate to="/secretaria" replace />}
        />

        {/* HOME SECRETARIA */}
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

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/secretaria" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
