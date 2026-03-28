import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "../styles/configuracion-medico.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ConfiguracionSecretaria() {
  const { session } = useAuth();

  const [seccion,   setSeccion]   = useState("perfil");

  // PASSWORD
  const [pwActual,  setPwActual]  = useState("");
  const [pwNueva,   setPwNueva]   = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwError,   setPwError]   = useState(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword() {
    setPwError(null);
    setPwSuccess(false);

    if (!pwActual || !pwNueva || !pwConfirm) { setPwError("Completa todos los campos"); return; }
    if (pwNueva !== pwConfirm) { setPwError("Las contraseñas no coinciden"); return; }
    if (pwNueva.length < 6)   { setPwError("Mínimo 6 caracteres"); return; }

    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({ password_actual: pwActual, password_nuevo: pwNueva })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al cambiar contraseña");
      }
      setPwSuccess(true);
      setPwActual(""); setPwNueva(""); setPwConfirm("");
    } catch (e) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="cfg-root">

      <div className="cfg-header">
        <h1>Configuración</h1>
        <p>{session?.usuario} · Secretaría</p>
      </div>

      <div className="cfg-content">

        {/* TABS */}
        <div className="cfg-tabs">
          {[
            { key: "perfil",   label: "Perfil" },
            { key: "password", label: "Contraseña" },
          ].map(t => (
            <button
              key={t.key}
              className={`cfg-tab${seccion === t.key ? " active" : ""}`}
              onClick={() => setSeccion(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* PERFIL */}
        {seccion === "perfil" && (
          <div className="cfg-card">
            <div className="cfg-field">
              <p className="cfg-field-label">Usuario</p>
              <p className="cfg-field-value">{session?.usuario}</p>
            </div>
            <div className="cfg-field">
              <p className="cfg-field-label">Rol</p>
              <p className="cfg-field-value">Secretaría</p>
            </div>
          </div>
        )}

        {/* CONTRASEÑA */}
        {seccion === "password" && (
          <div className="cfg-card">
            {pwError   && <p className="cfg-error">{pwError}</p>}
            {pwSuccess && <p className="cfg-success">✓ Contraseña actualizada</p>}

            {[
              { label: "Contraseña actual",    val: pwActual,  set: setPwActual },
              { label: "Nueva contraseña",     val: pwNueva,   set: setPwNueva },
              { label: "Confirmar contraseña", val: pwConfirm, set: setPwConfirm },
            ].map((f, i) => (
              <div key={i} className="cfg-field">
                <p className="cfg-field-label">{f.label}</p>
                <input
                  type="password"
                  className="cfg-input"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                />
              </div>
            ))}

            <button
              className="cfg-btn-primary"
              onClick={handleChangePassword}
              disabled={pwLoading}
            >
              {pwLoading ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
