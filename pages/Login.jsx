import { useState } from "react";
import "../styles/login.css";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!usuario || !clave) {
      setError("Debe ingresar usuario y contraseña");
      return;
    }

    // 🔒 Backend vendrá después
    console.log("Login:", { usuario, clave });

    setError("");
    alert("Login enviado (mock)");
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Ficha Clínica</h1>
        <p className="subtitle">Acceso profesionales</p>

        {error && <div className="error">{error}</div>}

        <label>Usuario</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="usuario"
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="••••••••"
        />

        <button type="submit">Ingresar</button>

        <p className="footer">
          © Instituto de Cirugía Articular
        </p>
      </form>
    </div>
  );
}
