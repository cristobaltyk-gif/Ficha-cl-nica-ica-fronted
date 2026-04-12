import "../../styles/agenda/agenda-slot-modal.css";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function AgendaSlotModalMedico({
  open,
  slot,
  loading = false,
  onClose,
  onAttend,
  onNoShow,
  onCancel,
  onRefresh,  // ← llama esto para recargar la agenda
}) {
  const { session } = useAuth();
  const [aceptando,   setAceptando]   = useState(false);
  const [aceptadoMsg, setAceptadoMsg] = useState(null);

  if (!open || !slot) return null;

  const { professional, professionalName, time, patient, status } = slot;

  const esGratuito         = slot.gratuito === true;
  const gratuitoConfirmado = slot.gratuito_confirmado === true;
  const gratuitoAceptado   = slot.gratuito_aceptado === true;

  const esSobrecupo         = slot.sobrecupo === true;
  const sobrecupoGratuito   = slot.sobrecupo_gratuito === true;
  const sobrecupoConfirmado = slot.sobrecupo_confirmado === true;
  const sobrecupoAceptado   = slot.sobrecupo_aceptado === true;

  const pacienteNombreCompleto = patient
    ? [patient.nombre, patient.apellido_paterno, patient.apellido_materno].filter(Boolean).join(" ")
    : null;

  async function handleAceptarGratuito() {
    setAceptando(true); setAceptadoMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/control/aceptar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({ date: slot.date, time: slot.time, professional: slot.professional }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Error"); }
      setAceptadoMsg("✅ Control gratuito aceptado");
      setTimeout(() => { onRefresh?.(); onClose(); }, 1200);
    } catch (e) { setAceptadoMsg(`❌ ${e.message}`); }
    finally     { setAceptando(false); }
  }

  async function handleAceptarSobrecupo() {
    setAceptando(true); setAceptadoMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/sobrecupo/aceptar`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({ date: slot.date, time: slot.time, professional: slot.professional }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Error"); }
      setAceptadoMsg("✅ Sobre cupo aceptado");
      setTimeout(() => { onRefresh?.(); onClose(); }, 1200);
    } catch (e) { setAceptadoMsg(`❌ ${e.message}`); }
    finally     { setAceptando(false); }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>🕒 Hora {time}</h3>

        <p><strong>Profesional:</strong> {professionalName || professional}</p>

        {patient && (
          <p><strong>Paciente:</strong> {pacienteNombreCompleto || patient.rut}</p>
        )}

        <p><strong>Estado:</strong> {status}</p>

        {/* ── CONTROL GRATUITO ── */}
        {esGratuito && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: 8, padding: "10px 14px", margin: "12px 0", fontSize: 13,
          }}>
            {gratuitoAceptado
              ? "✅ Control gratuito — ya aceptado"
              : gratuitoConfirmado
              ? "⏳ Paciente confirmó — pendiente su aceptación"
              : "📧 Control gratuito — esperando confirmación del paciente"}
          </div>
        )}

        {esGratuito && gratuitoConfirmado && !gratuitoAceptado && (
          <div className="modal-actions">
            <button className="primary" disabled={aceptando} onClick={handleAceptarGratuito}>
              {aceptando ? "Aceptando…" : "✓ Aceptar control gratuito"}
            </button>
          </div>
        )}

        {/* ── SOBRE CUPO ── */}
        {esSobrecupo && (
          <div style={{
            background: sobrecupoGratuito ? "#f0fdf4" : "#eff6ff",
            border: `1px solid ${sobrecupoGratuito ? "#86efac" : "#bfdbfe"}`,
            borderRadius: 8, padding: "10px 14px", margin: "12px 0", fontSize: 13,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              ➕ Sobre cupo {sobrecupoGratuito ? "· Sin costo" : "· Con costo"}
            </div>
            {sobrecupoAceptado
              ? "✅ Sobre cupo aceptado"
              : sobrecupoConfirmado
              ? "⏳ Paciente confirmó — pendiente su aceptación"
              : "📧 Sobre cupo — esperando confirmación del paciente"}
          </div>
        )}

        {esSobrecupo && sobrecupoConfirmado && !sobrecupoAceptado && (
          <div className="modal-actions">
            <button className="primary" disabled={aceptando} onClick={handleAceptarSobrecupo}>
              {aceptando ? "Aceptando…" : "✓ Aceptar sobre cupo"}
            </button>
          </div>
        )}

        {aceptadoMsg && (
          <p style={{ fontSize: 12, color: "#16a34a", margin: "6px 0" }}>{aceptadoMsg}</p>
        )}

        <div className="modal-actions">
          <button className="primary" disabled={loading} onClick={() => onAttend?.(slot)}>Atender</button>
          <button className="danger"  disabled={loading} onClick={() => onCancel?.(slot)}>Anular cita</button>
        </div>

        <div className="modal-footer">
          <button disabled={loading} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
