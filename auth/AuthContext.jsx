import { createContext, useContext, useState } from "react";

/*
AuthContext (CANÓNICO FINAL)

- Sesión persiste en sessionStorage
- Se borra solo al cerrar pestaña
- Backend es la fuente de verdad
*/

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // =========================
  // ESTADO
  // =========================
  const [session, setSession] = useState(() => {
    const stored = sessionStorage.getItem("session");
    return stored ? JSON.parse(stored) : null;
  });

  const [role, setRole] = useState(() => {
    const stored = sessionStorage.getItem("role");
    return stored ? JSON.parse(stored) : null;
  });

  const [professional, setProfessional] = useState(() => {
    return sessionStorage.getItem("professional");
  });

  // =========================
  // LOGIN / LOGOUT
  // =========================
  function login({ usuario, role, professional }) {
    const sessionData = { usuario };

    setSession(sessionData);
    setRole(role);
    setProfessional(professional || null);

    sessionStorage.setItem("session", JSON.stringify(sessionData));
    sessionStorage.setItem("role", JSON.stringify(role));

    if (professional) {
      sessionStorage.setItem("professional", professional);
    } else {
      sessionStorage.removeItem("professional");
    }
  }

  function logout() {
    setSession(null);
    setRole(null);
    setProfessional(null);

    sessionStorage.removeItem("session");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("professional");
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        role,
        professional,
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
