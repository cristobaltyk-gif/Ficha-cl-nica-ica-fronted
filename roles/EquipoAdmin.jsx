import { useState, useEffect } from "react";
import "../styles/pacientes/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const ROLES_PROFESIONAL = ["medico", "kine"];
const ROLES_USUARIO     = ["secretaria", "admin"];
const TODOS_ROLES       = [...ROLES_PROFESIONAL, ...ROLES_USUARIO];

const ESPECIALIDADES = [
  "Cadera", "Rodilla", "Hombro", "Columna", "Tobillo",
  "Kinesiología", "Traumatología", "Cirugía Articular"
];

export default function EquipoAdmin() {
  const [vista,         setVista]         = useState("lista"); // lista | nuevo | detalle
  const [miembros,      setMiembros]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [seleccionado,  setSeleccionado]  = useState(null);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(null);
  const [saving,        setSaving]        = useState(false);

  // FORM NUEVO
  const [form, setForm] = useState({
    rol:          "medico",
    nombre:       "",
    apellido:     "",
    rut:          "",
    especialidad: "",
    username:     "",
    password:     "",
  });

  useEffect(() => { loadMiembros(); }, []);

  async function loadMiembros() {
    setLoading(true);
    try {
      const [profRes, userRes] = await Promise.all([
        fetch(`${API_URL}/professionals`),
        fetch(`${API_URL}/admin/users`)
      ]);

      const profs = profRes.ok ? await profRes.json() : [];
      const users = userRes.ok ? await userRes.json() : [];

      // Combinar: profesionales + usuarios sin profesional asociado
      const profIds = new Set(profs.map(p => p.id));
      const soloUsuarios = users.filter(u =>
        !profIds.has(u.professional) &&
        u.role?.name !== "admin" &&
        u.username !== "public_web"
      );

      setMiembros([
        ...profs.map(p => ({ ...p, _tipo: "profesional" })),
        ...soloUsuarios.map(u => ({ ...u, _tipo: "usuario" }))
      ]);
    } catch {
      setMiembros([]);
    } finally {
      setLoading(false);
    }
  }

  function handleNuevo() {
    setForm({ rol: "medico", nombre: "", apellido: "", rut: "", especialidad: "", username: "", password: "" });
    setError(null);
    setSuccess(null);
    setVista("nuevo");
  }

  async function handleGuardar() {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const esProfesional = ROLES_PROFESIONAL.includes(form.rol);

      if (!form.nombre || !form.username || !form.password) {
        setError("Nombre, usuario y contraseña son obligatorios"); return;
      }

      if (esProfesional) {
        // Crear profesional — el backend crea el usuario automáticamente
        const id = form.username;
        const profesional = {
          id,
          name:      `${form.nombre} ${form.apellido}`.trim(),
          rut:       form.rut,
          specialty: form.especialidad,
          active:    true,
          username:  form.username,
          password:  form.password,
          role:      form.rol,
        };

        const res = await fetch(`${API_URL}/professionals`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(profesional)
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Error al crear profesional");
        }

      } else {
        // Crear solo usuario
        const res = await fetch(`${API_URL}/admin/users`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            username: form.username,
            password: form.password,
            nombre:   `${form.nombre} ${form.apellido}`.trim(),
            role:     form.rol,
            active:   true,
          })
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Error al crear usuario");
        }
      }

      setSuccess("✓ Creado correctamente");
      await loadMiembros();
      setTimeout(() => { setSuccess(null); setVista("lista"); }, 1500);

    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActivo(miembro) {
    try {
      if (miembro._tipo === "profesional") {
        await fetch(`${API_URL}/professionals/${miembro.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ active: !miembro.active })
        });
      } else {
        await fetch(`${API_URL}/admin/users/${miembro.username}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ active: !miembro.active })
        });
      }
      await loadMiembros();
    } catch {}
  }

  const esProf = ROLES_PROFESIONAL.includes(form.rol);

  return (
    <div className="dp-root">

      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{vista === "nuevo" ? "Nuevo miembro" : "Equipo"}</h1>
          {vista === "lista" && <p>{miembros.length} miembros registrados</p>}
        </div>
        {vista === "lista"
          ? <button className="dp-btn-primary" style={{ width: "auto", padding: "8px 16px" }} onClick={handleNuevo}>+ Nuevo</button>
          : <button className="dp-btn-secondary" onClick={() => setVista("lista")}>← Volver</button>
        }
      </div>

      <div className="dp-content">

        {/* LISTA */}
        {vista === "lista" && (
          <div className="dp-card">
            {loading && <p className="dp-empty">Cargando…</p>}
            {!loading && miembros.length === 0 && <p className="dp-empty">Sin miembros</p>}
            {miembros.map((m, i) => (
              <div
                key={m.id || m.username}
                className="dp-event-row"
                style={{ borderBottomColor: i < miembros.length - 1 ? "#f1f5f9" : "transparent", opacity: m.active === false ? 0.5 : 1 }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: m._tipo === "profesional" ? "#0f172a" : "#475569",
                  color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0
                }}>
                  {(m.name || m.username || "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="dp-event-diag">{m.name || m.username}</p>
                  <p className="dp-event-meta">
                    {m._tipo === "profesional"
                      ? `${m.specialty || ""} · ${m.role?.name || "médico"}`
                      : m.role?.name || "usuario"}
                    {m.active === false ? " · Inactivo" : ""}
                  </p>
                </div>
                <button
                  className="dp-btn-secondary"
                  style={{ fontSize: 11, padding: "4px 10px" }}
                  onClick={() => handleToggleActivo(m)}
                >
                  {m.active === false ? "Activar" : "Desactivar"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FORMULARIO NUEVO */}
        {vista === "nuevo" && (
          <div className="dp-card">
            {error   && <p className="dp-error" style={{ marginBottom: 12 }}>{error}</p>}
            {success && <p style={{ color: "#16a34a", fontSize: 13, marginBottom: 12, fontFamily: "'DM Sans', system-ui" }}>{success}</p>}

            {/* ROL */}
            <div className="dp-field">
              <p className="dp-field-label">Rol</p>
              <select
                value={form.rol}
                onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none" }}
              >
                {TODOS_ROLES.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* NOMBRE */}
            <div className="dp-field">
              <p className="dp-field-label">Nombre *</p>
              <input
                value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Apellido</p>
              <input
                value={form.apellido}
                onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* CAMPOS SOLO PROFESIONAL */}
            {esProf && (
              <>
                <div className="dp-field">
                  <p className="dp-field-label">RUT</p>
                  <input
                    value={form.rut}
                    onChange={e => setForm(p => ({ ...p, rut: e.target.value }))}
                    placeholder="12345678-9"
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div className="dp-field">
                  <p className="dp-field-label">Especialidad</p>
                  <select
                    value={form.especialidad}
                    onChange={e => setForm(p => ({ ...p, especialidad: e.target.value }))}
                    style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none" }}
                  >
                    <option value="">Seleccionar…</option>
                    {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </>
            )}

            {/* CREDENCIALES */}
            <div className="dp-field">
              <p className="dp-field-label">Usuario *</p>
              <input
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="ej: jperez"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="dp-field">
              <p className="dp-field-label">Contraseña inicial *</p>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "'DM Sans', system-ui", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <button
              className="dp-btn-primary"
              onClick={handleGuardar}
              disabled={saving}
              style={{ marginTop: 8 }}
            >
              {saving ? "Guardando…" : "Crear miembro"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
