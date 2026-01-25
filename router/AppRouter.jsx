import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

/* ===============================
   PÁGINA PÚBLICA
   =============================== */
import Login from "../pages/Login";

/* ===============================
   HOMES (por rol)
   =============================== */
import HomeSecretaria from "../pages/home/HomeSecretaria";

/* ===============================
   MÓDULOS
   =============================== */
import DashboardAgenda from "../pages/dashboard-agenda.jsx";
import DashboardPacientes from "../pages/dashboard-pacientes.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import DashboardDocumentos from "../pages/dashboard-documentos.jsx";
import DashboardAdministracion from "../pages/dashboard-administracion.jsx";

/* ===============================
   HELPERS
   =============================== */
function resolveHome(session, role) {
  if (session && role?.entry) return role.entry;
  return "/login";
}

/* ===============================
   GUARDS
   =============================== */
function AuthGuard({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

/**
 * RoleGuard GENÉRICO
 * - role.allow = ["agenda", "pacientes", ...]
 * - route = "agenda"
 */
function RoleGuard({ session, role, route, children }) {
  if (!session) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/" replace />;

  if (!role.allow?.includes(route)) {
    return <Navigate to={role.entry} replace />;
  }

  return children;
}

/* ===============================
   ROUTER PRINCIPAL (FINAL)
   =============================== */
export default function AppRouter() {
  const { session, role } = useAuth();
  const home = resolveHome(session, role);

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 ÚNICA RUTA PÚBLICA */}
        <Route path="/login" element={<Login />} />

        {/* 🧭 ROOT */}
        <Route path="/" element={<Navigate to={home} replace />} />

        {/* 🏠 HOME SECRETARÍA (protegido) */}
        <Route
          path="/secretaria"
          element={
            <AuthGuard session={session}>
              <HomeSecretaria />
            </AuthGuard>
          }
        />

        {/* 📅 AGENDA */}
        <Route
          path="/agenda"
          element={
            <RoleGuard session={session} role={role} route="agenda">
              <DashboardAgenda />
            </RoleGuard>
          }
        />

        {/* 👥 PACIENTES */}
        <Route
          path="/pacientes"
          element={
            <RoleGuard session={session} role={role} route="pacientes">
              <DashboardPacientes />
            </RoleGuard>
          }
        />

        {/* 🩺 ATENCIÓN */}
        <Route
          path="/atencion"
          element={
            <RoleGuard session={session} role={role} route="atencion">
              <DashboardAtencion />
            </RoleGuard>
          }
        />

        {/* 📄 DOCUMENTOS */}
        <Route
          path="/documentos"
          element={
            <RoleGuard session={session} role={role} route="documentos">
              <DashboardDocumentos />
            </RoleGuard>
          }
        />

        {/* ⚙️ ADMINISTRACIÓN */}
        <Route
          path="/administracion"
          element={
            <RoleGuard session={session} role={role} route="administracion">
              <DashboardAdministracion />
            </RoleGuard>
          }
        />

        {/* 🚫 FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
