import { useState, useEffect } from "react";
import "../styles/configuracion-medico.css";

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

export default function HorariosAdmin() {
  const [professionals, setProfessionals] = useState([]);
  const [selected,      setSelected]      = useState(null); // profesional seleccionado
  const [horarios,      setHorarios]      = useState({});
  const [loading,       setLoading]       = useState(true);
  const [horSuccess,    setHorSuccess]    = useState(null);
  const [horError,      setHorError]      = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();
        setProfessionals(await res.json());
      } catch {
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleSelectProfessional(prof) {
    setSelected(prof);
    setHorSuccess(null);
    setHorError(null);

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
    setHorError(null);
    setHorSuccess(null);
    const bloques = horarios[dia] || [];

    try {
      if (bloques.length === 0) {
        await fetch(`${API_URL}/admin/professionals/${selected.id}/day/${dia}`, {
          method: "DELETE",
        });
      } else {
        await fetch(`${API_URL}/admin/professionals/${selected.id}/day`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekday: dia, blocks: bloques, slotMinutes: 15 })
        });
      }
      setHorSuccess(dia);
      setTimeout(() => setHorSuccess(null), 2000);
    } catch {
      setHorError(dia);
    }
  }

  if (loading) return (
    <div className="cfg-root">
      <div className="cfg-header"><h1>Horarios</h1></div>
      <div className="cfg-content"><div className="cfg-card"><p className="cfg-empty">Cargando…</p></div></div>
    </div>
  );

  return (
    <div className="cfg-root">

      <div className="cfg-header">
        <h1>Horarios</h1>
        <p>{selected ? selected.name : "Selecciona un profesional"}</p>
      </div>

      <div className="cfg-content">

        {/* LISTA DE PROFESIONALES */}
        {!selected && (
          <div className="cfg-card">
            <p className="cfg-field-label" style={{ marginBottom: 12 }}>Profesionales</p>
            {professionals.length === 0 && <p className="cfg-empty">Sin profesionales</p>}
            {professionals.map((p, i) => (
              <div
                key={p.id}
                onClick={() => handleSelectProfessional(p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i < professionals.length - 1 ? "1px solid #f1f5f9" : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#0f172a", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, flexShrink: 0
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{p.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{p.specialty || p.id}</p>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* HORARIOS DEL PROFESIONAL SELECCIONADO */}
        {selected && (
          <>
            <button className="cfg-btn-secondary" onClick={() => setSelected(null)}>
              ← Volver a profesionales
            </button>

            {DIAS.map(({ key, label }) => (
              <div key={key} className="cfg-card">
                <div className="cfg-dia-header">
                  <p className="cfg-dia-label">{label}</p>
                  <div className="cfg-dia-actions">
                    <button className="cfg-btn-secondary" onClick={() => addBloque(key)}>
                      + Bloque
                    </button>
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
                    <input
                      type="time"
                      className="cfg-input-time"
                      value={b.start}
                      onChange={e => updateBloque(key, idx, "start", e.target.value)}
                    />
                    <span className="cfg-bloque-sep">—</span>
                    <input
                      type="time"
                      className="cfg-input-time"
                      value={b.end}
                      onChange={e => updateBloque(key, idx, "end", e.target.value)}
                    />
                    <button className="cfg-btn-remove" onClick={() => removeBloque(key, idx)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}
