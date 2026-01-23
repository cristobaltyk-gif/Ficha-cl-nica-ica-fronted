import { useState } from "react";
import "../styles/login.css";

// ⚠️ usa URL directa o una sola variable limpia
const API_URL = "https://ficha-clinica-backend.onrender.com";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, clave })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error de login");
      }

      // 🔑 DEVUELVE SESIÓN COMPLETA
      onLogin({
        usuario: data.usuario,
        role: data.role
      });

    } catch (err) {
      setError(err.message);
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
          onChange={e => setUsuario(e.target.value)}
        />

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
