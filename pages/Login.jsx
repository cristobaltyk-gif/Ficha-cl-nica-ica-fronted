import { useState } from "react";
import "../styles/login.css";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const { setSession, setRole } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!usuario || !clave) {
      setError("Ingresa usuario y contraseña");
      setLoading(false);
      return;
    }

    if (!API_URL) {
      setError("Backend no configurado (VITE_API_URL faltante)");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      // ✅ ÚNICO lugar donde se guarda sesión
      setSession({ usuario: data.usuario });
      setRole(data.role);

    } catch (err) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Ficha Clínica</h1>
        <p className="subtitle">Acceso profesionales</p>

        {error && <div className="error">{error}</div>}

        <label>Usuario</label>
        <input
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          autoComplete="current-password"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="footer">© Instituto de Cirugía Articular</div>
      </form>
    </div>
  );
}
