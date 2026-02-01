import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

/* ===============================
   PÚBLICO
=============================== */
import Login from "../pages/Login";

/* ===============================
   LAYOUT GLOBAL
=============================== */
import AppLayout from "./AppLayout";

/* ===============================
   CEREBROS (YA SON ROUTERS)
=============================== */
import SecretariaRouter from "./roles/SecretariaRouter";
import MedicoRouter from "./roles/MedicoRouter";
import KineRouter from "./roles/KineRouter";

/* ===============================
   HELPERS
=============================== */
function resolveHome(session, role) {
  if (session && role?.entry) return role.entry;
  return "/login";
}

/* ===============================
   GUARD
=============================== */
function AuthGuard({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

/* ===============================
   APP ROUTER — FINAL ICA
=============================== */
export default function AppRouter() {
  const { session, role } = useAuth();
  const home = resolveHome(session, role);

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 LOGIN */}
        <Route
          path="/login"
          element={
            session ? <Navigate to={home} replace /> : <Login />
          }
        />

        {/* 🧭 ROOT */}
        <Route path="/" element={<Navigate to={home} replace />} />

        {/* 🔒 APP PRIVADA */}
        <Route
          element={
            <AuthGuard session={session}>
              <AppLayout />
            </AuthGuard>
          }
        >
          {/* ===============================
              ENTREGA DE MANDO AL CEREBRO
          =============================== */}
          <Route
            path="/*"
            element={
              role?.name === "secretaria" ? (
                <SecretariaRouter />
              ) : role?.name === "medico" ? (
                <MedicoRouter />
              ) : role?.name === "kinesiologia" ? (
                <KineRouter />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Route>

        {/* 🚫 FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
