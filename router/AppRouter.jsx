import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { useState, useEffect } from "react";
import AtencionClinicaCerebro from "../roles/AtencionClinicaCerebro";
import BookingCerebro  from "../roles/BookingCerebro.jsx";
import BookingExterno  from "../pages/reservas/BookingExterno.jsx";
import BookingCentro   from "../pages/reservas/BookingCentro.jsx";
import Login           from "../pages/Login";
import AppLayout       from "./AppLayout";
import SecretariaCerebro  from "../roles/SecretariaCerebro.jsx";
import MedicoCerebro      from "../roles/MedicoCerebro.jsx";
import KineCerebro        from "../roles/KineCerebro.jsx";
import AdminCerebro       from "../roles/AdminCerebro.jsx";
import PsicologoCerebro   from "../roles/PsicologoCerebro.jsx";

const API_URL = import.meta.env.VITE_API_URL;

function resolveHome(session, role) {
  if (session && role?.entry) return role.entry;
  return "/login";
}

function AuthGuard({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function PublicRouter() {
  const host       = window.location.hostname;
  const subdominio = host.split(".")[0];
  const [tipo, setTipo] = useState(null);

  useEffect(() => {
    async function fetchTipo() {
      try {
        const res  = await fetch(`${API_URL}/api/suscripciones/tipo?scope=${subdominio}`);
        const data = await res.json();
        setTipo(data.tipo);
      } catch {
        setTipo("externo_completo");
      }
    }
    fetchTipo();
  }, [subdominio]);

  if (!tipo) return <div style={{ minHeight: "100vh", background: "#f8fafc" }} />;

  if (tipo === "centro") return <BookingCentro />;
  return <BookingExterno />;
}

export default function AppRouter() {
  const { session, role } = useAuth();
  const home = resolveHome(session, role);
  const host = window.location.hostname;

  if (host.startsWith("reservas.")) {
    return <BookingCerebro />;
  }

  const subdominio = host.split(".")[0];
  if (
    subdominio !== "clinica" &&
    subdominio !== "reservas" &&
    subdominio !== "localhost" &&
    subdominio !== "admin"
  ) {
    return <PublicRouter />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to={home} replace /> : <Login />}
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
