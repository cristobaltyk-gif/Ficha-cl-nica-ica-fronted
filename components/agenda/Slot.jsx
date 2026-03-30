import "../../styles/agenda/agenda-slot-modal.css";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AgendaSlotModalSecretaria({
  open,
  slot,
  loading = false,
  onClose,
  onConfirm,
  onCancel,
  onReschedule,
  onConfirmarLlegada
}) {
  const [marcandoGratuito, setMarcandoGratuito] = useState(false);
  const [gratuitoMsg,      setGratuitoMsg]      = useState(null);

  useEffect(() => {
    if (open) {
      setGratuitoMsg(null);
      setMarcandoGratuito(false);
    }
  }, [open]);

  if (!open || !slot) return null;

  const { time, status, patient, pagado } = slot;
  const tieneReserva = status === "reserved" || status === "confirmed";

  const esGratuito          = slot.gratuito === true;
  const gratuitoConfirmado  = slot.gratuito_confirmado === true;
  const gratuitoAceptado    = slot.gratuito_aceptado === true;

  async function handleMarcarGratuito() {
    if (!slot.professional && !slot.professionalId) return;
    setMarcandoGratuito(true);
    setGratuitoMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/control/gratuito`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          date:         slot.date,
          time:         slot.time,
          professional: slot.professional
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || "Error");

      setGratuitoMsg(
        data.email_enviado
          ? `✓ Email enviado a ${data.email}`
          : "✓ Marcado como gratuito (sin email — paciente sin correo)"
      );
    } catch (e) {
      setGratuitoMsg(`❌ ${e.message}`);
    } finally {
      setMarcandoGratuito(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <h3>🕒 Hora {time}</h3>
        <p><strong>Profesional:</strong> {slot.professionalName}</p>
        {patient && (
          <p><strong>Paciente:</strong> {patient.nombre || patient.rut}</p>
        )}
        <p><strong>Estado:</strong> {status}</p>

        {/* ── ESTADO GRATUITO ── */}
        {esGratuito && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: 8, padding: "10px 14px", margin: "8px 0", fontSize: 13
          }}>
            {gratuitoAceptado
              ? "✅ Control gratuito — aceptado por médico"
              : gratuitoConfirmado
              ? "⏳ Control gratuito — confirmado por paciente, pendiente médico"
              : "📧 Control gratuito — esperando confirmación del paciente"}
          </div>
        )}

        {/* ── CONFIRMAR LLEGADA ── */}
        {tieneReserva && !pagado && !esGratuito && (
          <div className="modal-caja">
            <button className="caja-btn caja-btn--llego" onClick={onConfirmarLlegada}>
              ✓ Confirmar llegada
            </button>
          </div>
        )}

        {tieneReserva && pagado && (
          <div className="modal-caja">
            <span className="caja-done">✓ Registrado en caja</span>
          </div>
        )}

        {/* ── MARCAR GRATUITO ── */}
        {tieneReserva && !esGratuito && !pagado && (
          <div className="modal-caja">
            <button
              className="caja-btn"
              style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #86efac" }}
              onClick={handleMarcarGratuito}
              disabled={marcandoGratuito}
            >
              {marcandoGratuito ? "Enviando…" : "🎁 Marcar como gratuito"}
            </button>
          </div>
        )}

        {gratuitoMsg && (
          <p style={{ fontSize: 12, color: "#16a34a", margin: "6px 0" }}>{gratuitoMsg}</p>
        )}

        {/* ── ACCIONES AGENDA ── */}
        <div className="modal-actions">
          {status === "reserved" && (
            <>
              <button disabled={loading} onClick={onConfirm}>Confirmar paciente</button>
              <button className="danger" disabled={loading} onClick={onCancel}>Anular reserva</button>
            </>
          )}
          {status === "confirmed" && (
            <>
              <button disabled={loading} onClick={onReschedule}>Cambiar hora</button>
              <button className="danger" disabled={loading} onClick={onCancel}>Anular cita</button>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button disabled={loading} onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
          }
