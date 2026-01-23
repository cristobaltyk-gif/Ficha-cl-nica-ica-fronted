import { useState } from "react";

import Login from "./pages/Login";
import Medico from "./pages/Medico";
import Secretaria from "./pages/Secretaria";

export default function App() {
  const [session, setSession] = useState(null);
  // session = { usuario, role }

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  if (session.role === "MEDICO") {
    return <Medico session={session} onLogout={() => setSession(null)} />;
  }

  if (session.role === "SECRETARIA") {
    return <Secretaria session={session} onLogout={() => setSession(null)} />;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Rol no implementado</h2>
      <button onClick={() => setSession(null)}>Cerrar sesión</button>
    </div>
  );
}
