import "../../styles/agenda/agenda-slot-modal.css";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";

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
  const { session } = useAuth();

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

  const esGratuito         = slot.gratuito === true;
  const gratuitoConfirmado = slot.gratuito_confirmado === true;
  const gratuitoAceptado   = slot.gratuito_aceptado === true;

  return (
    <div className="modal-backdrop">
      <div className="modal">

        <h3>🕒 Hora {time}</h3>
        <p><strong>Profesional:</strong> {slot.professionalName}</p>
        {patient && (
          <p><strong>Paciente:</strong> {patient.nombre || patient.rut}</p>
        )}
        <p><strong>Estado:</strong> {status}</p>

        {/* ESTADO GRATUITO */}
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

        {/* CONFIRMAR LLEGADA */}
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

        {/* ACCIONES AGENDA */}
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
