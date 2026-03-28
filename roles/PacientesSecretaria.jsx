import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { useLocation } from "react-router-dom";
import "../styles/pacientes/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const PREVISIONES = [
  "Fonasa A", "Fonasa B", "Fonasa C", "Fonasa D",
  "Banmedica", "Colmena", "Cruz Blanca", "Consalud",
  "Masvida", "Vida Tres", "Particular"
];

export default function PacientesSecretaria() {
  const { session } = useAuth();
  const location    = useLocation();

  const [vista,  setVista]  = useState("buscar"); // "buscar" | "ficha" | "crear"
  const [rut,    setRut]    = useState("");
  const [admin,  setAdmin]  = useState(null);
  const [error,  setError]  = useState(null);
  const [loading, setLoading] = useState(false);

  // CREAR
  const [form, setForm] = useState({
    rut: "", nombre: "", apellido_paterno: "", apellido_materno: "",
    fecha_nacimiento: "", direccion: "", telefono: "", email: "", prevision: ""
  });
  const [createError,   setCreateError]   = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [creating,      setCreating]      = useState(false);

  useEffect(() => {
    if (location.state?.rut) {
      setRut(location.state.rut);
      handleBuscar(location.state.rut);
      window.history.replaceState({}, document.title);
    }
  }, []);

  async function handleBuscar(rutOverride) {
    const rutBuscar = (rutOverride || rut).trim();
    if (!rutBuscar) return;
    setLoading(true);
    setError(null);
    setAdmin(null);

    try {
      const res = await fetch(`${API_URL}/api/fichas/admin/${rutBuscar}`, {
        headers: { "X-Internal-User": session?.usuario }
      });
      if (res.status === 404) throw new Error("Paciente no encontrado");
      if (!res.ok) throw new Error("Error al buscar paciente");
      setAdmin(await res.json());
      setVista("ficha");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCrear() {
    setCreateError(null);
    setCreating(true);

    const required = ["rut", "nombre", "apellido_paterno", "fecha_nacimiento"];
    for (const f of required) {
      if (!form[f]?.trim()) {
        setCreateError(`Campo requerido: ${f.replace("_", " ")}`);
        setCreating(false);
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/fichas/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al crear paciente");
      }
      setCreateSuccess(true);
      setAdmin({ ...form });
      setVista("ficha");
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  }

  function handleReset() {
    setVista("buscar");
    setAdmin(null);
    setRut("");
    setError(null);
    setCreateError(null);
    setCreateSuccess(false);
    setForm({ rut: "", nombre: "", apellido_paterno: "", apellido_materno: "",
              fecha_nacimiento: "", direccion: "", telefono: "", email: "", prevision: "" });
  }

  return (
    <div className="dp-root">

      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{vista === "crear" ? "Nuevo paciente" : admin ? `${admin.nombre} ${admin.apellido_paterno}` : "Pacientes"}</h1>
          {admin && vista === "ficha" && <p>{admin.rut} · {admin.prevision}</p>}
          {vista === "buscar" && !admin && <p>Búsqueda y registro de pacientes</p>}
        </div>
        {vista !== "buscar" && (
          <button className="dp-btn-secondary" onClick={handleReset}>← Volver</button>
        )}
      </div>

      <div className="dp-content">

        {/* ERROR */}
        {error && <div className="dp-card"><p className="dp-error">{error}</p></div>}

        {/* BUSCAR */}
        {vista === "buscar" && (
          <>
            <div className="dp-card">
              <p className="dp-label">Buscar por RUT</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={rut}
                  onChange={e => setRut(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleBuscar()}
                  placeholder="12345678-9"
                  style={{
                    flex: 1, padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui",
                    outline: "none"
                  }}
                />
                <button
                  className="dp-btn-primary"
                  style={{ width: "auto", padding: "10px 16px" }}
                  onClick={() => handleBuscar()}
                  disabled={loading}
                >
                  {loading ? "…" : "Buscar"}
                </button>
              </div>
            </div>

            <button
              className="dp-btn-primary"
              onClick={() => setVista("crear")}
            >
              + Registrar nuevo paciente
            </button>
          </>
        )}

        {/* FICHA */}
        {vista === "ficha" && admin && (
          <div className="dp-card">
            {[
              { label: "Nombre completo",  value: `${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}` },
              { label: "RUT",             value: admin.rut },
              { label: "Fecha nacimiento", value: admin.fecha_nacimiento },
              { label: "Previsión",       value: admin.prevision },
              { label: "Teléfono",        value: admin.telefono },
              { label: "Email",           value: admin.email },
              { label: "Dirección",       value: admin.direccion },
            ]
              .filter(f => f.value?.trim())
              .map((f, i) => (
                <div key={i} className="dp-field">
                  <p className="dp-field-label">{f.label}</p>
                  <p className="dp-field-value">{f.value}</p>
                </div>
              ))}
          </div>
        )}

        {/* CREAR */}
        {vista === "crear" && (
          <div className="dp-card">
            {createError && <p className="dp-error" style={{ marginBottom: 16 }}>{createError}</p>}

            {[
              { key: "rut",              label: "RUT *",              type: "text",   placeholder: "12345678-9" },
              { key: "nombre",           label: "Nombre *",           type: "text",   placeholder: "" },
              { key: "apellido_paterno", label: "Apellido paterno *", type: "text",   placeholder: "" },
              { key: "apellido_materno", label: "Apellido materno",   type: "text",   placeholder: "" },
              { key: "fecha_nacimiento", label: "Fecha de nacimiento *", type: "date", placeholder: "" },
              { key: "telefono",         label: "Teléfono",           type: "tel",    placeholder: "" },
              { key: "email",            label: "Email",              type: "email",  placeholder: "" },
              { key: "direccion",        label: "Dirección",          type: "text",   placeholder: "" },
            ].map(f => (
              <div key={f.key} className="dp-field">
                <p className="dp-field-label">{f.label}</p>
                <input
                  type={f.type}
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                    borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui",
                    outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}

            {/* PREVISIÓN */}
            <div className="dp-field">
              <p className="dp-field-label">Previsión</p>
              <select
                value={form.prevision}
                onChange={e => setForm(prev => ({ ...prev, prevision: e.target.value }))}
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0",
                  borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui",
                  outline: "none", background: "#fff"
                }}
              >
                <option value="">Seleccionar…</option>
                {PREVISIONES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <button
              className="dp-btn-primary"
              onClick={handleCrear}
              disabled={creating}
              style={{ marginTop: 8 }}
            >
              {creating ? "Registrando…" : "Registrar paciente"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
