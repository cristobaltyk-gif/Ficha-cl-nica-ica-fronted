import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import "../styles/configuracion-medico.css";
import BloqueoAgendaModal from "../components/agenda/BloqueoAgendaModal.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const DIAS = [
  { key: "monday",    label: "Lunes" },
  { key: "tuesday",   label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday",  label: "Jueves" },
  { key: "friday",    label: "Viernes" },
  { key: "saturday",  label: "Sábado" },
  { key: "sunday",    label: "Domingo" },
];

export default function ConfiguracionMedico() {
  const { session, professional } = useAuth();

  const [perfil,     setPerfil]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [seccion,    setSeccion]    = useState("perfil");

  // PASSWORD
  const [pwActual,   setPwActual]   = useState("");
  const [pwNueva,    setPwNueva]    = useState("");
  const [pwConfirm,  setPwConfirm]  = useState("");
  const [pwError,    setPwError]    = useState(null);
  const [pwSuccess,  setPwSuccess]  = useState(false);
  const [pwLoading,  setPwLoading]  = useState(false);

  // HORARIOS
  const [horarios,   setHorarios]   = useState({});
  const [horSuccess, setHorSuccess] = useState(null);
  const [horError,   setHorError]   = useState(null);

  // BLOQUEOS
  const [showBloqueo, setShowBloqueo] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const prof = data.find(p => p.id === professional);
        if (prof) {
          setPerfil(prof);
          const dias = prof.schedule?.days || {};
          const init = {};
          DIAS.forEach(d => {
            const bloques = dias[d.key];
            if (bloques) {
              const arr = Array.isArray(bloques) ? bloques : bloques.blocks || [];
              init[d.key] = arr.map(b => ({ start: b.start, end: b.end }));
            } else {
              init[d.key] = [];
            }
          });
          setHorarios(init);
        }
      } catch {
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [professional]);

  async function handleChangePassword() {
    setPwError(null); setPwSuccess(false);
    if (!pwActual || !pwNueva || !pwConfirm) { setPwError("Completa todos los campos"); return; }
    if (pwNueva !== pwConfirm) { setPwError("Las contraseñas no coinciden"); return; }
    if (pwNueva.length < 6) { setPwError("Mínimo 6 caracteres"); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({ password_actual: pwActual, password_nuevo: pwNueva })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al cambiar contraseña"); }
      setPwSuccess(true);
      setPwActual(""); setPwNueva(""); setPwConfirm("");
    } catch (e) { setPwError(e.message); }
    finally { setPwLoading(false); }
  }

  function addBloque(dia) {
    setHorarios(prev => ({ ...prev, [dia]: [...(prev[dia] || []), { start: "09:00", end: "13:00" }] }));
  }

  function removeBloque(dia, idx) {
    setHorarios(prev => ({ ...prev, [dia]: prev[dia].filter((_, i) => i !== idx) }));
  }

  function updateBloque(dia, idx, field, value) {
    setHorarios(prev => {
      const copy = [...prev[dia]];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, [dia]: copy };
    });
  }

  async function handleGuardarHorario(dia) {
    setHorError(null); setHorSuccess(null);
    const bloques = horarios[dia] || [];
    try {
      if (bloques.length === 0) {
        await fetch(`${API_URL}/admin/professionals/${professional}/day/${dia}`, {
          method: "DELETE", headers: { "X-Internal-User": session?.usuario }
        });
      } else {
        await fetch(`${API_URL}/admin/professionals/${professional}/day`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
          body: JSON.stringify({ weekday: dia, blocks: bloques, slotMinutes: 15 })
        });
      }
      setHorSuccess(dia);
      setTimeout(() => setHorSuccess(null), 2000);
    } catch { setHorError(dia); }
  }

  if (loading) return (
    <div className="cfg-root">
      <div className="cfg-header"><h1>Configuración</h1></div>
      <div className="cfg-content">
        <div className="cfg-card"><p className="cfg-empty">Cargando…</p></div>
      </div>
    </div>
  );

  return (
    <div className="cfg-root">

      <div className="cfg-header">
        <h1>Configuración</h1>
        {perfil && <p>{perfil.name}{perfil.specialty ? ` · ${perfil.specialty}` : ""}</p>}
      </div>

      <div className="cfg-content">

        {/* TABS */}
        <div className="cfg-tabs">
          {[
            { key: "perfil",    label: "Perfil" },
            { key: "password",  label: "Contraseña" },
            { key: "horarios",  label: "Horarios" },
            { key: "bloqueos",  label: "Bloqueos" },
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

        {/* ── PERFIL ── */}
        {seccion === "perfil" && perfil && (
          <div className="cfg-card">
            {[
              { label: "Nombre",       value: perfil.name },
              { label: "ID",           value: perfil.id },
              { label: "Especialidad", value: perfil.specialty },
            ].filter(f => f.value).map((f, i) => (
              <div key={i} className="cfg-field">
                <p className="cfg-field-label">{f.label}</p>
                <p className="cfg-field-value">{f.value}</p>
              </div>
            ))}
            {perfil.firma && (
              <div className="cfg-field">
                <p className="cfg-field-label">Firma</p>
                <img className="cfg-img" src={`${API_URL}/assets/${perfil.firma}`} alt="Firma"
                  onError={e => e.target.style.display = "none"} />
              </div>
            )}
            {perfil.timbre && (
              <div className="cfg-field">
                <p className="cfg-field-label">Timbre</p>
                <img className="cfg-img" src={`${API_URL}/assets/${perfil.timbre}`} alt="Timbre"
                  onError={e => e.target.style.display = "none"} />
              </div>
            )}
          </div>
        )}

        {/* ── CONTRASEÑA ── */}
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
                <input type="password" className="cfg-input" value={f.val}
                  onChange={e => f.set(e.target.value)} />
              </div>
            ))}
            <button className="cfg-btn-primary" onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? "Guardando…" : "Cambiar contraseña"}
            </button>
          </div>
        )}

        {/* ── HORARIOS ── */}
        {seccion === "horarios" && DIAS.map(({ key, label }) => (
          <div key={key} className="cfg-card">
            <div className="cfg-dia-header">
              <p className="cfg-dia-label">{label}</p>
              <div className="cfg-dia-actions">
                <button className="cfg-btn-secondary" onClick={() => addBloque(key)}>+ Bloque</button>
                <button
                  className={`cfg-btn-save${horSuccess === key ? " success" : ""}`}
                  onClick={() => handleGuardarHorario(key)}
                >
                  {horSuccess === key ? "✓ Guardado" : "Guardar"}
                </button>
              </div>
            </div>
            {(horarios[key] || []).length === 0 && (
              <p className="cfg-empty">Sin horario — día libre</p>
            )}
            {(horarios[key] || []).map((b, idx) => (
              <div key={idx} className="cfg-bloque-row">
                <input type="time" className="cfg-input-time" value={b.start}
                  onChange={e => updateBloque(key, idx, "start", e.target.value)} />
                <span className="cfg-bloque-sep">—</span>
                <input type="time" className="cfg-input-time" value={b.end}
                  onChange={e => updateBloque(key, idx, "end", e.target.value)} />
                <button className="cfg-btn-remove" onClick={() => removeBloque(key, idx)}>×</button>
              </div>
            ))}
          </div>
        ))}

        {/* ── BLOQUEOS ── */}
        {seccion === "bloqueos" && (
          <div className="cfg-card">
            <div className="cfg-field">
              <p className="cfg-field-label">Bloqueo de agenda</p>
              <p className="cfg-field-value" style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                Bloquea días completos o slots específicos para que no aparezcan disponibles en la agenda.
              </p>
              <button className="cfg-btn-primary" onClick={() => setShowBloqueo(true)}>
                🔒 Gestionar bloqueos
              </button>
            </div>
          </div>
        )}

      </div>

      <BloqueoAgendaModal
        open={showBloqueo}
        professional={professional}
        internalUser={session?.usuario}
        onClose={() => setShowBloqueo(false)}
        onSuccess={() => setShowBloqueo(false)}
      />

    </div>
  );
}
