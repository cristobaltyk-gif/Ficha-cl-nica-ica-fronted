import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AtencionClinicaCerebro from "../roles/AtencionClinicaCerebro";

import BookingCerebro from "../roles/BookingCerebro.jsx";
import BookingExterno from "../pages/reservas/BookingExterno.jsx";
import BookingCentro  from "../pages/reservas/BookingCentro.jsx";

import Login from "../pages/Login";

import AppLayout from "./AppLayout";

import SecretariaCerebro      from "../roles/SecretariaCerebro.jsx";
import MedicoCerebro          from "../roles/MedicoCerebro.jsx";
import KineCerebro            from "../roles/KineCerebro.jsx";
import AdminCerebro           from "../roles/AdminCerebro.jsx";
import PsicologoCerebro       from "../roles/PsicologoCerebro.jsx";

function resolveHome(session, role) {
  if (session && role?.entry) return role.entry;
  return "/login";
}

function AuthGuard({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  const { session, role } = useAuth();
  const home = resolveHome(session, role);

  const host       = window.location.hostname;
  const subdominio = host.split(".")[0];

  if (host.startsWith("reservas.")) {
    return <BookingCerebro />;
  }

  if (subdominio === "externo") {
    return <BookingExterno />;
  }

  if (
    subdominio !== "clinica" &&
    subdominio !== "reservas" &&
    subdominio !== "localhost" &&
    subdominio !== "admin"
  ) {
    return <BookingCentro />;
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={
            session ? <Navigate to={home} replace /> : <Login />
          }
        />

        <Route path="/" element={<Navigate to={home} replace />} />

        <Route
          element={
            <AuthGuard session={session}>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/atencion"      element={<AtencionClinicaCerebro />} />
          <Route path="/secretaria/*"  element={<SecretariaCerebro />} />
          <Route path="/medico/*"      element={<MedicoCerebro />} />
          <Route path="/kine/*"        element={<KineCerebro />} />
          <Route path="/admin/*"       element={<AdminCerebro />} />
          <Route path="/psicologo/*"   element={<PsicologoCerebro />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
