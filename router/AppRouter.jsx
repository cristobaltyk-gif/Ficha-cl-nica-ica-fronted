import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

/* ===============================
   PÁGINAS PÚBLICAS
   =============================== */
import Login from "../pages/Login";

/* ===============================
   HOMES (por ahora solo secretaría)
   Luego agregarás HomeMedico, HomeAdmin, etc.
   =============================== */
import HomeSecretaria from "../pages/home/HomeSecretaria";

/* ===============================
   DASHBOARDS / MÓDULOS
   =============================== */
import DashboardAgenda from "../pages/dashboard-agenda.jsx";
import DashboardPacientes from "../pages/dashboard-pacientes.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import DashboardDocumentos from "../pages/dashboard-documentos.jsx";
import DashboardAdministracion from "../pages/dashboard-administracion.jsx";

/* ===============================
   HELPERS
   =============================== */

/**
 * Decide a dónde ir en "/"
 * - Con sesión + role.entry → entry del backend
 * - Sin sesión → /login
 */
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
 * - NO hardcodea roles
 * - NO asume nombres
 * - Compara RUTAS reales ("/agenda", "/pacientes", etc.)
 */
function RoleGuard({ session, role, route, children }) {
  if (!session) return <Navigate to="/login" replace />;

  if (!role) return <Navigate to="/" replace />;

  const routePath = `/${route}`;

  if (!role.allow?.includes(routePath)) {
    return <Navigate to={role.entry} replace />;
  }

  return children;
}

/* ===============================
   ROUTER PRINCIPAL
   =============================== */

export default function AppRouter() {
  const { session, role } = useAuth();
  const home = resolveHome(session, role);

  return (
    <BrowserRouter>
      <Routes>
        {/* ===============================
           RUTA PÚBLICA ÚNICA
           =============================== */}
        <Route path="/login" element={<Login />} />

        {/* ===============================
           ROOT
           =============================== */}
        <Route path="/" element={<Navigate to={home} replace />} />

        {/* ===============================
           HOMES (protegidos)
           =============================== */}
        <Route
          path="/secretaria"
          element={
            <AuthGuard session={session}>
              <HomeSecretaria />
            </AuthGuard>
          }
        />

        {/* ===============================
           MÓDULOS (por permisos)
           =============================== */}
        <Route
          path="/agenda"
          element={
            <RoleGuard session={session} role={role} route="agenda">
              <DashboardAgenda />
            </RoleGuard>
          }
        />

        <Route
          path="/pacientes"
          element={
            <RoleGuard session={session} role={role} route="pacientes">
              <DashboardPacientes />
            </RoleGuard>
          }
        />

        <Route
          path="/atencion"
          element={
            <RoleGuard session={session} role={role} route="atencion">
              <DashboardAtencion />
            </RoleGuard>
          }
        />

        <Route
          path="/documentos"
          element={
            <RoleGuard session={session} role={role} route="documentos">
              <DashboardDocumentos />
            </RoleGuard>
          }
        />

        <Route
          path="/administracion"
          element={
            <RoleGuard session={session} role={role} route="administracion">
              <DashboardAdministracion />
            </RoleGuard>
          }
        />

        {/* ===============================
           FALLBACK
           =============================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
