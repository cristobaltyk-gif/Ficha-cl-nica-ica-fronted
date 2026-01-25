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
   HELPERS
   =============================== */
function getHomePath(session, role) {
  // ✅ si hay sesión, el backend define el home del rol
  if (session && role?.entry) return role.entry;

  // ✅ sin sesión: login
  return "/login";
}

/* ===============================
   AUTH GUARD (SESIÓN)
   =============================== */
function AuthGuard({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

/* ===============================
   ROLE GUARD (PERMISOS)
   =============================== */
function RoleGuard({ session, role, route, children }) {
  // si no hay sesión, afuera
  if (!session) return <Navigate to="/login" replace />;

  // si no hay rol aún (ej. todavía hidratando), manda al home genérico (root)
  if (!role) return <Navigate to="/" replace />;

  // si no tiene permiso, vuelve al HOME DEL ROL (no a secretaría)
  if (!role.allow?.includes(route)) {
    return <Navigate to={role.entry || "/"} replace />;
  }

  return children;
}

/* ===============================
   ROUTER PRINCIPAL (CANÓNICO)
   =============================== */
export default function AppRouter() {
  const { session, role } = useAuth();
  const homePath = getHomePath(session, role);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ ÚNICA RUTA PÚBLICA */}
        <Route path="/login" element={<Login />} />

        {/* ✅ ROOT: decide con session + role.entry */}
        <Route path="/" element={<Navigate to={homePath} replace />} />

        {/* ✅ HOME (ejemplo: secretaría)
            OJO: para médico/admin crearás su Home cuando exista,
            y role.entry apuntará a esa ruta.
        */}
        <Route
          path="/secretaria"
          element={
            <AuthGuard session={session}>
              <HomeSecretaria />
            </AuthGuard>
          }
        />

        {/* ✅ MÓDULOS PROTEGIDOS POR PERMISOS */}
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

        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
