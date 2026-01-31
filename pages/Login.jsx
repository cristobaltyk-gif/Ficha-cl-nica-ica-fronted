import { useState } from "react";
import "../styles/login.css";
import { useAuth } from "../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

/*
Login — PRODUCCIÓN REAL

✔ Backend es la fuente de verdad
✔ Guarda role COMPLETO
✔ Guarda professional SOLO si viene
✔ No inventa datos
*/

export default function Login() {
  const { login } = useAuth();

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      // ===============================
      // VALIDACIÓN DEFENSIVA MÍNIMA
      // ===============================
      if (!data.usuario || !data.role) {
        throw new Error("Respuesta inválida del servidor");
      }

      if (!data.role.entry || !Array.isArray(data.role.allow)) {
        throw new Error("Rol inválido recibido desde backend");
      }

      // ===============================
      // LOGIN FINAL (ÚNICO PUNTO)
      // ===============================
      login({
        usuario: data.usuario,
        role: data.role,
        professional: data.professional || null
      });

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
