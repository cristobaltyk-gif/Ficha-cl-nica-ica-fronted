import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AtencionClinicaCerebro from "../roles/AtencionClinicaCerebro";

/* ===============================
   NUEVO — RESERVAS
=============================== */
import BookingCerebro from "../roles/BookingCerebro.jsx";

/* ===============================
   PÚBLICO
=============================== */
import Login from "../pages/Login";

/* ===============================
   LAYOUT GLOBAL
=============================== */
import AppLayout from "./AppLayout";

/* ===============================
   CEREBROS
=============================== */
import SecretariaCerebro from "../roles/SecretariaCerebro.jsx";
import MedicoCerebro from "../roles/MedicoCerebro.jsx";
import KineCerebro from "../roles/KineCerebro.jsx";

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

  const host = window.location.hostname;

  /* ===============================
     RESERVAS SUBDOMINIO
     (NO pasa por Auth ni Layout)
  =============================== */
  if (host.startsWith("reservas.")) {
    return <BookingCerebro />;
  }

  /* ===============================
     RESTO (CLÍNICA + WWW)
     SIN CAMBIOS
  =============================== */

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
          <Route
            path="/atencion"
            element={<AtencionClinicaCerebro />}
          />

          {/* ===============================
              ENTREGA DE MANDO A CADA CEREBRO
          =============================== */}
          <Route path="/secretaria/*" element={<SecretariaCerebro />} />
          <Route path="/medico/*" element={<MedicoCerebro />} />
          <Route path="/kine/*" element={<KineCerebro />} />
        </Route>

        {/* 🚫 FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
