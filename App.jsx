import { useState } from "react";
import Login from "./pages/Login";
import AppRouter from "./router/AppRouter";

/**
 * App raíz
 * - Login SOLO valida credenciales
 * - App controla sesión
 * - Router SIEMPRE existe
 * - Sin sesión => Login visible
 * - Con sesión => flujo por rol
 */
export default function App() {
  const [session, setSession] = useState(null);
  // session = { usuario, role }

  return (
    <>
      {/* 🔐 Login bloqueante si NO hay sesión */}
      {!session && (
        <Login onLogin={setSession} />
      )}

      {/* 🧭 Router SIEMPRE montado */}
      <AppRouter
        session={session}
        onLogout={() => setSession(null)}
      />
    </>
  );
}
