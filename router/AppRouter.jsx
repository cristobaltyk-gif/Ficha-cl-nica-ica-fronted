import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

/* ===============================
   PÁGINA PÚBLICA
   =============================== */
import Login from "../pages/Login";

/* ===============================
   LAYOUT GLOBAL (TopBar + Outlet)
   =============================== */
import AppLayout from "./AppLayout";

/* ===============================
   HOMES
   =============================== */
import HomeSecretaria from "../pages/home/HomeSecretaria";
import HomeMedico from "../pages/home/HomeMedico";
import HomeKinesiologia from "../pages/home/HomeKinesiologia";

/* ===============================
   MÓDULOS
   =============================== */
import DashboardAgenda from "../pages/dashboard-agenda.jsx";
import DashboardPacientes from "../pages/dashboard-pacientes.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import DashboardDocumentos from "../pages/dashboard-documentos.jsx";
import DashboardAdministracion from "../pages/dashboard-administracion.jsx";

/* ===============================
   CONTROLADOR MÉDICO (AGENDA)
   =============================== */
import AgendaMedicoController from "../components/agenda/AgendaMedicoController.jsx";

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

function RoleGuard({ session, role, route, children }) {
  if (!session) return <Navigate to="/login" replace />;

  // ⏳ Esperar role cargado desde sessionStorage
  if (!role) return null;

  // 🚫 Sin permiso → vuelve al home del rol
  if (!role.allow?.includes(route)) {
    return <Navigate to={role.entry} replace />;
  }

  return children;
}

/* ===============================
   ROUTER PRINCIPAL (FINAL ICA)
   =============================== */
export default function AppRouter() {
  const { session, role } = useAuth();
  const home = resolveHome(session, role);

  return (
    <BrowserRouter>
      <Routes>
        {/* ===============================
            🔓 LOGIN (única ruta pública)
           =============================== */}
        <Route
          path="/login"
          element={
            session ? (
              <Navigate to={home} replace />
            ) : (
              <Login />
            )
          }
        />

        {/* ===============================
            🧭 ROOT
           =============================== */}
        <Route path="/" element={<Navigate to={home} replace />} />

        {/* ===============================
            🔒 APP PRIVADA (Layout Global)
           =============================== */}
        <Route
          element={
            <AuthGuard session={session}>
              <AppLayout />
            </AuthGuard>
          }
        >
          {/* ===== HOMES ===== */}
          <Route path="/secretaria" element={<HomeSecretaria />} />
          <Route path="/medico" element={<HomeMedico />} />
          <Route path="/kine" element={<HomeKinesiologia />} />

          {/* ===== MÓDULOS ===== */}

          {/* 📅 Agenda */}
          <Route
            path="/agenda"
            element={
              <RoleGuard session={session} role={role} route="agenda">
                {role?.name === "medico" ? (
                  <AgendaMedicoController />
                ) : (
                  <DashboardAgenda />
                )}
              </RoleGuard>
            }
          />

          {/* 👥 Pacientes */}
          <Route
            path="/pacientes"
            element={
              <RoleGuard session={session} role={role} route="pacientes">
                <DashboardPacientes />
              </RoleGuard>
            }
          />

          {/* 🩺 Atención */}
          <Route
            path="/atencion"
            element={
              <RoleGuard session={session} role={role} route="atencion">
                <DashboardAtencion />
              </RoleGuard>
            }
          />

          {/* 📄 Documentos */}
          <Route
            path="/documentos"
            element={
              <RoleGuard session={session} role={role} route="documentos">
                <DashboardDocumentos />
              </RoleGuard>
            }
          />

          {/* ⚙️ Administración */}
          <Route
            path="/administracion"
            element={
              <RoleGuard session={session} role={role} route="administracion">
                <DashboardAdministracion />
              </RoleGuard>
            }
          />
        </Route>

        {/* ===============================
            🚫 FALLBACK
           =============================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
