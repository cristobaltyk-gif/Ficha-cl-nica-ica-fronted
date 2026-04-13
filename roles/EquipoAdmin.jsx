import { useState, useEffect } from "react";
import "../styles/admin/equipo-admin.css";
import HorariosAdmin from "./HorariosAdmin.jsx";
import ValoresProfesionalForm from "./ValoresProfesionalForm.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const ROLES_PROFESIONAL = ["medico", "kine"];
const ROLES_USUARIO     = ["secretaria", "admin"];
const TODOS_ROLES       = [...ROLES_PROFESIONAL, ...ROLES_USUARIO];

const ESPECIALIDADES = [
  "Cadera", "Rodilla", "Hombro", "Columna", "Tobillo",
  "Kinesiología", "Traumatología", "Cirugía Articular"
];

// ── Tabs disponibles según tipo ──────────────────────────────
function getTabsForMiembro(m) {
  const base = [{ key: "info", label: "Información" }, { key: "sedes", label: "Sedes" }];
  if (m._tipo === "profesional") {
    base.push({ key: "horarios", label: "Horarios" });
    base.push({ key: "valores",  label: "Valores" });
  }
  return base;
}

// ── SedesForm ────────────────────────────────────────────────
function SedesForm({ pid }) {
  const [regiones,      setRegiones]      = useState([]);
  const [sedesActuales, setSedesActuales] = useState({});
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [regRes, sedeRes] = await Promise.all([
          fetch(`${API_URL}/geo/sedes/regiones`),
          fetch(`${API_URL}/geo/sedes/${pid}`),
        ]);
        const regs  = regRes.ok  ? await regRes.json()  : [];
        const sedes = sedeRes.ok ? await sedeRes.json() : { regiones: {} };
        setRegiones(regs);
        setSedesActuales(sedes.regiones || {});
      } catch {
        setError("Error cargando datos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pid]);

  function toggleRegion(regionId) {
    setSedesActuales(prev => {
      const next = { ...prev };
      if (next[regionId]) { delete next[regionId]; }
      else { next[regionId] = [{ centro: "", direccion: "" }]; }
      return next;
    });
  }

  function updateCentro(regionId, idx, field, value) {
    setSedesActuales(prev => {
      const next  = { ...prev };
      const lista = [...(next[regionId] || [])];
      lista[idx]  = { ...lista[idx], [field]: value };
      next[regionId] = lista;
      return next;
    });
  }

  function addCentro(regionId) {
    setSedesActuales(prev => ({
      ...prev,
      [regionId]: [...(prev[regionId] || []), { centro: "", direccion: "" }],
    }));
  }

  function removeCentro(regionId, idx) {
    setSedesActuales(prev => {
      const lista = (prev[regionId] || []).filter((_, i) => i !== idx);
      if (lista.length === 0) {
        const next = { ...prev }; delete next[regionId]; return next;
      }
      return { ...prev, [regionId]: lista };
    });
  }

  async function handleGuardar() {
    setSaving(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`${API_URL}/geo/sedes/${pid}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ regiones: sedesActuales }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSuccess("✓ Sedes guardadas correctamente");
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="ea-empty">Cargando…</p>;

  return (
    <div>
      {error   && <div className="ea-error">{error}</div>}
      {success && <div className="ea-success">{success}</div>}
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Selecciona las regiones donde atiende este miembro y completa los datos del centro.
      </p>
      {regiones.map(r => {
        const activa  = !!sedesActuales[r.id];
        const centros = sedesActuales[r.id] || [];
        return (
          <div key={r.id} className="ea-region-block">
            <div className="ea-region-header" onClick={() => toggleRegion(r.id)}>
              <h4>
                <span style={{ marginRight: 8 }}>{activa ? "✓" : "○"}</span>
                {r.nombre}
              </h4>
              {activa && (
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                  {centros.length} centro{centros.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {activa && (
              <div className="ea-region-body">
                {centros.map((c, idx) => (
                  <div key={idx} className="ea-centro-block">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Centro {idx + 1}</span>
                      {centros.length > 1 && (
                        <button className="ea-btn-danger" style={{ padding: "2px 8px", fontSize: 11 }} onClick={() => removeCentro(r.id, idx)}>
                          Quitar
                        </button>
                      )}
                    </div>
                    <div className="ea-field">
                      <p className="ea-field-label">Nombre del centro</p>
                      <input className="ea-input" value={c.centro} placeholder="Ej: Instituto de Cirugía Articular"
                        onChange={e => updateCentro(r.id, idx, "centro", e.target.value)} />
                    </div>
                    <div className="ea-field" style={{ marginBottom: 0 }}>
                      <p className="ea-field-label">Dirección</p>
                      <input className="ea-input" value={c.direccion} placeholder="Ej: Avenida España 998, Curicó"
                        onChange={e => updateCentro(r.id, idx, "direccion", e.target.value)} />
                    </div>
                  </div>
                ))}
                <button className="ea-btn-secondary" style={{ marginTop: 8, fontSize: 12 }} onClick={() => addCentro(r.id)}>
                  + Agregar otro centro en {r.nombre}
                </button>
              </div>
            )}
          </div>
        );
      })}
      <button className="ea-btn-primary" onClick={handleGuardar} disabled={saving} style={{ width: "100%", marginTop: 8 }}>
        {saving ? "Guardando…" : "Guardar sedes"}
      </button>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function EquipoAdmin() {
  const [vista,         setVista]         = useState("lista");
  const [miembros,      setMiembros]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [seleccionado,  setSeleccionado]  = useState(null);
  const [tabDetalle,    setTabDetalle]    = useState("info");
  const [error,         setError]         = useState(null);
  const [success,       setSuccess]       = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [confirmBorrar, setConfirmBorrar] = useState(null);

  const [form, setForm] = useState({
    rol: "medico", nombre: "", apellido: "",
    rut: "", especialidad: "", username: "", password: "",
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

  function abrirDetalle(m) {
    setSeleccionado(m);
    setTabDetalle("info");
    setError(null); setSuccess(null);
    setVista("detalle");
  }

  function handleNuevo() {
    setForm({ rol: "medico", nombre: "", apellido: "", rut: "", especialidad: "", username: "", password: "" });
    setError(null); setSuccess(null);
    setVista("nuevo");
  }

  async function handleGuardar() {
    setError(null); setSuccess(null); setSaving(true);
    try {
      const esProfesional = ROLES_PROFESIONAL.includes(form.rol);
      if (!form.nombre || !form.username || !form.password) {
        setError("Nombre, usuario y contraseña son obligatorios"); return;
      }
      if (esProfesional) {
        const res = await fetch(`${API_URL}/professionals`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: form.username, name: `${form.nombre} ${form.apellido}`.trim(),
            rut: form.rut, specialty: form.especialidad,
            active: true, username: form.username, password: form.password, role: form.rol,
          })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Error"); }
      } else {
        const res = await fetch(`${API_URL}/admin/users`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username, password: form.password,
            nombre: `${form.nombre} ${form.apellido}`.trim(), role: form.rol, active: true,
          })
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Error"); }
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

  async function handleToggleActivo(m, e) {
    e.stopPropagation();
    try {
      if (m._tipo === "profesional") {
        await fetch(`${API_URL}/professionals/${m.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !m.active })
        });
      } else {
        await fetch(`${API_URL}/admin/users/${m.username}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !m.active })
        });
      }
      await loadMiembros();
    } catch {}
  }

  async function handleEliminar(m) {
    try {
      if (m._tipo === "profesional") {
        await fetch(`${API_URL}/professionals/${m.id}`, { method: "DELETE" });
        await fetch(`${API_URL}/geo/sedes/${m.id}`, { method: "DELETE" }).catch(() => {});
      } else {
        await fetch(`${API_URL}/admin/users/${m.username}`, { method: "DELETE" });
        await fetch(`${API_URL}/geo/sedes/${m.username}`, { method: "DELETE" }).catch(() => {});
      }
      setConfirmBorrar(null);
      setVista("lista");
      await loadMiembros();
    } catch {}
  }

  const sedesPid = seleccionado
    ? (seleccionado._tipo === "profesional" ? seleccionado.id : seleccionado.username)
    : null;

  const esProf = ROLES_PROFESIONAL.includes(form.rol);
  const tabs   = seleccionado ? getTabsForMiembro(seleccionado) : [];

  return (
    <div className="ea-root">

      {/* HEADER */}
      <div className="ea-header">
        <div>
          <h1>
            {vista === "nuevo"   ? "Nuevo miembro" :
             vista === "detalle" ? seleccionado?.name || seleccionado?.username :
             "Equipo"}
          </h1>
          {vista === "lista" && <p>{miembros.length} miembros registrados</p>}
        </div>
        {vista === "lista"
          ? <button className="ea-btn-primary" onClick={handleNuevo}>+ Nuevo</button>
          : <button className="ea-btn-secondary" onClick={() => setVista("lista")}>← Volver</button>
        }
      </div>

      {/* LISTA */}
      {vista === "lista" && (
        <div className="ea-card">
          {loading && <p className="ea-empty">Cargando…</p>}
          {!loading && miembros.length === 0 && <p className="ea-empty">Sin miembros</p>}
          {miembros.map(m => (
            <div key={m.id || m.username} className="ea-member-row" onClick={() => abrirDetalle(m)}>
              <div className={`ea-avatar ${m._tipo === "usuario" ? "usuario" : ""} ${m.active === false ? "inactivo" : ""}`}>
                {(m.name || m.username || "?").charAt(0).toUpperCase()}
              </div>
              <div className="ea-member-info">
                <p className="ea-member-name">
                  {m.name || m.username}
                  {m.active === false && <span className="ea-badge inactivo">Inactivo</span>}
                </p>
                <p className="ea-member-meta">
                  {m._tipo === "profesional"
                    ? `${m.specialty || ""} · ${m.role?.name || "médico"}`
                    : m.role?.name || "usuario"}
                </p>
              </div>
              <div className="ea-member-actions" onClick={e => e.stopPropagation()}>
                <button className="ea-btn-secondary" onClick={e => handleToggleActivo(m, e)}>
                  {m.active === false ? "Activar" : "Desactivar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETALLE */}
      {vista === "detalle" && seleccionado && (
        <div>
          <div className="ea-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`ea-tab ${tabDetalle === t.key ? "active" : ""}`}
                onClick={() => setTabDetalle(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="ea-card" style={{ padding: 16 }}>

            {/* INFO */}
            {tabDetalle === "info" && (
              <div>
                <div className="ea-field">
                  <p className="ea-field-label">Nombre</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
                    {seleccionado.name || seleccionado.username}
                  </p>
                </div>
                {seleccionado.specialty && (
                  <div className="ea-field">
                    <p className="ea-field-label">Especialidad</p>
                    <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>{seleccionado.specialty}</p>
                  </div>
                )}
                {seleccionado.rut && (
                  <div className="ea-field">
                    <p className="ea-field-label">RUT</p>
                    <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>{seleccionado.rut}</p>
                  </div>
                )}
                <div className="ea-field">
                  <p className="ea-field-label">Estado</p>
                  <p style={{ margin: 0, fontSize: 14, color: seleccionado.active === false ? "#dc2626" : "#16a34a" }}>
                    {seleccionado.active === false ? "Inactivo" : "Activo"}
                  </p>
                </div>
                <hr className="ea-divider" />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="ea-btn-secondary" onClick={e => handleToggleActivo(seleccionado, { ...e, stopPropagation: () => {} })}>
                    {seleccionado.active === false ? "Activar" : "Desactivar"}
                  </button>
                  <button className="ea-btn-danger" onClick={() => setConfirmBorrar(seleccionado)}>
                    Eliminar
                  </button>
                </div>
              </div>
            )}

            {/* SEDES */}
            {tabDetalle === "sedes" && sedesPid && <SedesForm pid={sedesPid} />}

            {/* HORARIOS — solo profesionales */}
            {tabDetalle === "horarios" && seleccionado._tipo === "profesional" && (
              <HorariosAdmin professional={seleccionado} />
            )}

            {/* VALORES — solo profesionales */}
            {tabDetalle === "valores" && seleccionado._tipo === "profesional" && (
              <ValoresProfesionalForm professional={seleccionado} />
            )}

          </div>
        </div>
      )}

      {/* FORMULARIO NUEVO */}
      {vista === "nuevo" && (
        <div className="ea-card" style={{ padding: 16 }}>
          {error   && <div className="ea-error">{error}</div>}
          {success && <div className="ea-success">{success}</div>}
          <div className="ea-field">
            <p className="ea-field-label">Rol</p>
            <select className="ea-input" value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}>
              {TODOS_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <div className="ea-field">
            <p className="ea-field-label">Nombre *</p>
            <input className="ea-input" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
          </div>
          <div className="ea-field">
            <p className="ea-field-label">Apellido</p>
            <input className="ea-input" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} />
          </div>
          {esProf && (
            <>
              <div className="ea-field">
                <p className="ea-field-label">RUT</p>
                <input className="ea-input" value={form.rut} placeholder="12345678-9" onChange={e => setForm(p => ({ ...p, rut: e.target.value }))} />
              </div>
              <div className="ea-field">
                <p className="ea-field-label">Especialidad</p>
                <select className="ea-input" value={form.especialidad} onChange={e => setForm(p => ({ ...p, especialidad: e.target.value }))}>
                  <option value="">Seleccionar…</option>
                  {ESPECIALIDADES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="ea-field">
            <p className="ea-field-label">Usuario *</p>
            <input className="ea-input" value={form.username} placeholder="ej: jperez" onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div className="ea-field">
            <p className="ea-field-label">Contraseña inicial *</p>
            <input className="ea-input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <button className="ea-btn-primary" onClick={handleGuardar} disabled={saving} style={{ width: "100%", marginTop: 8 }}>
            {saving ? "Guardando…" : "Crear miembro"}
          </button>
        </div>
      )}

      {/* MODAL CONFIRMAR BORRAR */}
      {confirmBorrar && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%" }}>
            <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>¿Eliminar miembro?</p>
            <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748b" }}>
              Esta acción no se puede deshacer. Se eliminará <strong>{confirmBorrar.name || confirmBorrar.username}</strong> del sistema.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ea-btn-danger"
