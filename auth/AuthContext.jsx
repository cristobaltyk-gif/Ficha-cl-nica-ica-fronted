import { createContext, useContext, useState, useEffect } from "react";

/*
AuthContext (CANÓNICO FINAL)
Reglas:
- Mantiene sesión al RECARGAR
- Borra sesión al CERRAR pestaña / navegador
- Usa sessionStorage (NO localStorage)
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

  // =========================
  // LIMPIEZA AL CERRAR PESTAÑA
  // =========================
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.clear();
    };

    window.addEventListener("unload", handleUnload);
    return () =>
      window.removeEventListener("unload", handleUnload);
  }, []);

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
