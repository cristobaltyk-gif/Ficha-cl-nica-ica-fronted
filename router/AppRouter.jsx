import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* ===============================
   CONTEXTO DE AUTENTICACIÓN
   (VIENE DEL BACKEND)
   =============================== */
import { useAuth } from "../auth/AuthContext.jsx";

/* ===============================
   HOME / LOGIN
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
   AUTH GUARD (SESIÓN)
   =============================== */
function AuthGuard({ session, children }) {
  if (!session) {
    return <Navigate to="/secretaria" replace />;
  }
  return children;
}

/* ===============================
   ROLE GUARD (PERMISOS)
   🔑 CLAVE: NO REDIRIGE SI role AÚN NO CARGA
   =============================== */
function RoleGuard({ role, route, children }) {
  // ⏳ Esperar a que el rol llegue desde el backend
  if (!role) {
    return null; // o loader si quieres
  }

  if (!role.allow?.includes(route)) {
    return <Navigate to={role.entry || "/secretaria"} replace />;
  }

  return children;
}

/* ===============================
   ROUTER PRINCIPAL
   =============================== */
export default function AppRouter() {
  /**
   * session → existe SOLO si login fue exitoso
   * role    → viene del backend (secretaria, medico, admin, etc.)
   */
  const { session, role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* ROOT */}
        <Route
          path="/"
          element={<Navigate to="/secretaria" replace />}
        />

        {/* LOGIN / HOME */}
        <Route
          path="/secretaria"
          element={<HomeSecretaria />}
        />

        {/* ===============================
           ZONA PROTEGIDA
           =============================== */}

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
          element={<Navigate to="/secretaria" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
