import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * SobrecupoModal
 * Props:
 *   open         — boolean
 *   professional — id del profesional
 *   date         — fecha inicial sugerida (YYYY-MM-DD)
 *   onClose      — fn()
 *   onSuccess    — fn() — recarga agenda
 */
export default function SobrecupoModal({ open, professional, date, onClose, onSuccess }) {
  const [rut,      setRut]      = useState("");
  const [fecha,    setFecha]    = useState(date || "");
  const [hora,     setHora]     = useState("");
  const [gratuito, setGratuito] = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  if (!open) return null;

  function handleClose() {
    setRut(""); setFecha(date || ""); setHora("");
    setGratuito(false); setError(""); setSuccess("");
    onClose();
  }

  async function handleGuardar() {
    setError(""); setSuccess("");

    if (!rut.trim())   { setError("Ingrese el RUT del paciente"); return; }
    if (!fecha.trim()) { setError("Ingrese la fecha");            return; }
    if (!hora.trim())  { setError("Ingrese la hora");             return; }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/sobrecupo`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rut:          rut.trim(),
          date:         fecha.trim(),
          time:         hora.trim(),
          professional,
          gratuito,
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || "Error al crear sobre cupo");
      }

      setSuccess("✓ Sobre cupo creado. Email enviado al paciente.");
      setTimeout(() => { onSuccess?.(); handleClose(); }, 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 300, padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 18, padding: 24,
        maxWidth: 400, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>+ Sobre cupo</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Slot adicional fuera de horario</div>
          </div>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}
          >✕</button>
        </div>

        {error   && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{success}</div>}

        {/* RUT */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>RUT Paciente *</p>
          <input
            value={rut}
            onChange={e => setRut(e.target.value)}
            placeholder="12345678-9"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Fecha */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Fecha *</p>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Hora */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Hora *</p>
          <input
            type="time"
            value={hora}
            onChange={e => setHora(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Gratuito toggle */}
        <div
          onClick={() => setGratuito(g => !g)}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px",
            background: gratuito ? "#f0fdf4" : "#f8fafc",
            border: `1px solid ${gratuito ? "#86efac" : "#e2e8f0"}`,
            borderRadius: 10, cursor: "pointer", marginBottom: 18,
            transition: "all 0.15s",
          }}
        >
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: gratuito ? "#16a34a" : "#fff",
            border: `2px solid ${gratuito ? "#16a34a" : "#cbd5e1"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {gratuito && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: gratuito ? "#16a34a" : "#0f172a" }}>
              Atención gratuita
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {gratuito ? "Sin costo para el paciente" : "Con valor normal de consulta"}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleGuardar}
            disabled={saving}
            style={{
              flex: 1, background: "#0f172a", color: "#fff",
              border: "none", borderRadius: 10, padding: "12px 0",
              fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1, fontFamily: "inherit",
            }}
          >
            {saving ? "Creando…" : "Crear sobre cupo"}
          </button>
          <button
            onClick={handleClose}
            style={{
              flex: 1, background: "#fff", color: "#0f172a",
              border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 0",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
