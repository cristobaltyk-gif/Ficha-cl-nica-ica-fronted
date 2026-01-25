import { createContext, useContext, useState } from "react";

/*
AuthContext
- Guarda sesión activa
- Guarda rol (viene del backend)
- NO hace fetch aquí
*/

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // ej: { userId, token }
  const [role, setRole] = useState(null);       // ej: { name, allow, entry }

  return (
    <AuthContext.Provider
      value={{
        session,
        role,
        setSession,
        setRole
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
