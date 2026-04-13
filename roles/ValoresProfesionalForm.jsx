import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const TIPOS_LABELS = {
  particular:       "Particular",
  control_costo:    "Control con costo",
  control_gratuito: "Control gratuito",
  sobrecupo:        "Sobre cupo",
  kinesiologia:     "Kinesiología",
  paquete_10:       "Paquete 10 sesiones",
};

function formatMonto(v) {
  if (v === 0) return "Gratis";
  return `$${Number(v).toLocaleString("es-CL")}`;
}

function ValorRow({ tipo, valor, onChange, onDelete }) {
  const [editando, setEditando] = useState(false);
  const [input,    setInput]    = useState(String(valor));

  function handleSave() {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n >= 0) onChange(tipo, n);
    setEditando(false);
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "11px 0", borderBottom: "1px solid #f1f5f9", gap: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          {TIPOS_LABELS[tipo] || tipo}
        </p>
        <p style={{ margin: "1px 0 0", fontSize: 11, color: "#94a3b8" }}>{tipo}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {editando ? (
          <>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              autoFocus
              style={{
                width: 90, padding: "5px 8px", border: "1px solid #e2e8f0",
                borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none",
              }}
            />
            <button onClick={handleSave} style={{
              background: "#0f172a", color: "#fff", border: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 12,
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>✓</button>
            <button onClick={() => { setEditando(false); setInput(String(valor)); }} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 7, padding: "5px 10px", fontSize: 12,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>✕</button>
          </>
        ) : (
          <>
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: "monospace",
              color: valor === 0 ? "#16a34a" : "#0f172a",
            }}>
              {formatMonto(valor)}
            </span>
            <button onClick={() => { setEditando(true); setInput(String(valor)); }} style={{
              background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0",
              borderRadius: 7, padding: "4px 9px", fontSize: 11,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>Editar</button>
            <button onClick={() => onDelete(tipo)} style={{
              background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
              borderRadius: 7, padding: "4px 9px", fontSize: 11,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ValoresProfesionalForm({ professional }) {
  const { session } = useAuth();

  const [valores,    setValores]    = useState({});
  const [globales,   setGlobales]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);
  const [nuevoTipo,  setNuevoTipo]  = useState("");
  const [nuevoValor, setNuevoValor] = useState("");

  useEffect(() => {
    if (!professional?.id) return;
    cargar();
  }, [professional?.id]);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/caja/admin/config`, {
        headers: { "X-Internal-User": session?.usuario }
      });
      if (!res.ok) throw new Error("Error cargando config");
      const data = await res.json();
      const glob = Object.fromEntries(
        Object.entries(data).filter(([k]) => k !== "por_profesional")
      );
      setGlobales(glob);
      setValores(data.por_profesional?.[professional.id] || {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(tipo, valor) {
    setValores(prev => ({ ...prev, [tipo]: valor }));
  }

  function handleDelete(tipo) {
    setValores(prev => {
      const copy = { ...prev };
      delete copy[tipo];
      return copy;
    });
  }

  function handleAgregar() {
    const v = parseInt(nuevoValor, 10);
    if (!nuevoTipo.trim() || isNaN(v) || v < 0) return;
    setValores(prev => ({ ...prev, [nuevoTipo.trim()]: v }));
    setNuevoTipo(""); setNuevoValor("");
  }

  async function handleGuardar() {
    setSaving(true); setError(null); setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/caja/admin/config/profesional`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({ professional_id: professional.id, valores }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Error"); }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ fontSize: 13, color: "#94a3b8", padding: "12px 0" }}>Cargando…</p>;

  const tiposDisponibles = Object.keys(TIPOS_LABELS).filter(k => !(k in valores));

  return (
    <div>
      {error   && <p className="ea-error">{error}</p>}
      {success && <p className="ea-success">✓ Valores guardados</p>}

      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Valores específicos para este profesional. Si no se define un tipo, usa el valor global como fallback.
      </p>

      {Object.keys(valores).length === 0 && (
        <p style={{ fontSize: 13, color: "#94a3b8", padding: "8px 0" }}>
          Sin config específica — usando valores globales
        </p>
      )}

      {Object.entries(valores).map(([tipo, valor]) => (
        <ValorRow
          key={tipo}
          tipo={tipo}
          valor={valor}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      ))}

      {/* Agregar tipo */}
      <div style={{
        marginTop: 16, padding: 14, background: "#f8fafc",
        border: "1px solid #e2e8f0", borderRadius: 10,
      }}>
        <p className="ea-field-label" style={{ marginBottom: 8 }}>Agregar tipo</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={nuevoTipo}
            onChange={e => setNuevoTipo(e.target.value)}
            style={{
              flex: 1, minWidth: 140, padding: "8px 10px", border: "1px solid #e2e8f0",
              borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none", background: "#fff",
            }}
          >
            <option value="">Tipo…</option>
            {tiposDisponibles.map(k => (
              <option key={k} value={k}>{TIPOS_LABELS[k]}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Valor $"
            value={nuevoValor}
            onChange={e => setNuevoValor(e.target.value)}
            style={{
              width: 100, padding: "8px 10px", border: "1px solid #e2e8f0",
              borderRadius: 7, fontSize: 13, fontFamily: "inherit", outline: "none",
            }}
          />
          <button onClick={handleAgregar} style={{
            background: "#0f172a", color: "#fff", border: "none",
            borderRadius: 7, padding: "8px 14px", fontSize: 13,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>
            + Agregar
          </button>
        </div>

        {/* Fallbacks globales */}
        {Object.keys(globales).length > 0 && (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Valores globales (fallback):</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(globales).map(([k, v]) => (
                <span key={k} style={{
                  fontSize: 11, padding: "3px 8px", background: "#f1f5f9",
                  borderRadius: 6, color: "#64748b", fontFamily: "monospace",
                }}>
                  {TIPOS_LABELS[k] || k}: {formatMonto(v)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        className="ea-btn-primary"
        onClick={handleGuardar}
        disabled={saving}
        style={{ width: "100%", marginTop: 16 }}
      >
        {saving ? "Guardando…" : "Guardar valores"}
      </button>
    </div>
  );
}
