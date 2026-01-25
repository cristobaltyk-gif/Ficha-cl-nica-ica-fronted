import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

/* ===============================
   PÁGINAS
   =============================== */
import Login from "../pages/Login";
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
   AUTH GUARD
   =============================== */
function AuthGuard({ session, children }) {
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* ===============================
   ROLE GUARD
   =============================== */
function RoleGuard({ role, route, children }) {
  if (!role || !role.allow?.includes(route)) {
    return <Navigate to={role?.entry || "/"} replace />;
  }
  return children;
}

/* ===============================
   ROUTER PRINCIPAL
   =============================== */
export default function AppRouter() {
  const { session, role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN (ÚNICA RUTA PÚBLICA) */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* ROOT */}
        <Route
          path="/"
          element={
            session
              ? <Navigate to="/secretaria" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* ===============================
           ZONA PROTEGIDA
           =============================== */}

        {/* HOME SECRETARIA */}
        <Route
          path="/secretaria"
          element={
            <AuthGuard session={session}>
              <HomeSecretaria />
            </AuthGuard>
          }
        />

        {/* AGENDA */}
        <Route
          path="/agenda"
          element={
            <AuthGuard session={session}>
              <RoleGuard role={role} route="agenda">
                <DashboardAgenda />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* PACIENTES */}
        <Route
          path="/pacientes"
          element={
            <AuthGuard session={session}>
              <RoleGuard role={role} route="pacientes">
                <DashboardPacientes />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* ATENCIÓN */}
        <Route
          path="/atencion"
          element={
            <AuthGuard session={session}>
              <RoleGuard role={role} route="atencion">
                <DashboardAtencion />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* DOCUMENTOS */}
        <Route
          path="/documentos"
          element={
            <AuthGuard session={session}>
              <RoleGuard role={role} route="documentos">
                <DashboardDocumentos />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* ADMINISTRACIÓN */}
        <Route
          path="/administracion"
          element={
            <AuthGuard session={session}>
              <RoleGuard role={role} route="administracion">
                <DashboardAdministracion />
              </RoleGuard>
            </AuthGuard>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
