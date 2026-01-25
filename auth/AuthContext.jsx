import { createContext, useContext, useState } from "react";

/*
AuthContext (CANÓNICO)
- Guarda sesión activa
- Guarda rol (backend)
- Expone login / logout
- NO expone setters crudos
*/

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { usuario }
  const [role, setRole] = useState(null);       // { name, allow, entry }

  // =========================
  // ACCIONES
  // =========================

  function login({ usuario, role }) {
    setSession({ usuario });
    setRole(role);
  }

  function logout() {
    setSession(null);
    setRole(null);
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
