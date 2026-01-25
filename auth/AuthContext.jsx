import { createContext, useContext, useState } from "react";

/*
AuthContext (CANÓNICO FINAL)

Reglas REALES:
- Mantiene sesión al RECARGAR
- Borra sesión SOLO al cerrar pestaña / navegador
- Usa sessionStorage (NO localStorage)
- NO borra sesión en navegación interna
*/

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // =========================
  // ESTADO (hidrata desde sessionStorage)
  // =========================
  const [session, setSession] = useState(() => {
    const stored = sessionStorage.getItem("session");
    return stored ? JSON.parse(stored) : null;
  });

  const [role, setRole] = useState(() => {
    const stored = sessionStorage.getItem("role");
    return stored ? JSON.parse(stored) : null;
  });

  // =========================
  // LOGIN / LOGOUT
  // =========================
  function login({ usuario, role }) {
    const sessionData = { usuario };

    setSession(sessionData);
    setRole(role);

    sessionStorage.setItem("session", JSON.stringify(sessionData));
    sessionStorage.setItem("role", JSON.stringify(role));
  }

  function logout() {
    setSession(null);
    setRole(null);

    sessionStorage.removeItem("session");
    sessionStorage.removeItem("role");
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        role,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
