import { useState } from "react";
import Secretaria from "./Secretaria";
import "../styles/login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, clave }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error de login");
      }

      setRole(data.role);
    } catch (err) {
      setError(err.message);
    }
  }

  // 🔑 activación por rol
  if (role === "SECRETARIA") {
    return <Secretaria />;
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <h1>Ficha Clínica</h1>
        <p className="subtitle">Acceso profesionales</p>

        {error && <div className="error">{error}</div>}

        <label>Usuario</label>
        <input value={usuario} onChange={e => setUsuario(e.target.value)} />

        <label>Contraseña</label>
        <input
          type="password"
          value={clave}
          onChange={e => setClave(e.target.value)}
        />

        <button type="submit">Ingresar</button>

        <div className="footer">
          © Instituto de Cirugía Articular
        </div>
      </form>
    </div>
  );
}
