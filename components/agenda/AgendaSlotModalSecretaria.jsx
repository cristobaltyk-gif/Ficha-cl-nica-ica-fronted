import "../../styles/agenda/agenda-slot-modal.css";
import { useState, useEffect } from "react";
import PatientForm from "../patient/PatientForm";

export default function AgendaSlotModalSecretaria({
  open,
  slot,
  loading = false,

  onClose,
  onReserve,
  onConfirm,
  onCancel,
  onReschedule,
  onConfirmarLlegada
}) {
  const [mode,       setMode]       = useState("actions");
  const [formAction, setFormAction] = useState(null);

  useEffect(() => {
    if (open) {
      setMode("actions");
      setFormAction(null);
    }
  }, [open]);

  if (!open || !slot) return null;

  const { time, status, patient, pagado } = slot;
  const tieneReserva = status === "reserved" || status === "confirmed";

  function handlePatientSubmit(p) {
    if (formAction === "reserve") onReserve?.({ slot, patient: p });
    if (formAction === "confirm") onConfirm?.({ slot, patient: p });
    setMode("actions");
    setFormAction(null);
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

        {/* ── CONFIRMAR LLEGADA ── */}
        {tieneReserva && !pagado && (
          <div className="modal-caja">
            <button
              className="caja-btn caja-btn--llego"
              onClick={onConfirmarLlegada}
            >
              ✓ Confirmar llegada
            </button>
          </div>
        )}

        {tieneReserva && pagado && (
          <div className="modal-caja">
            <span className="caja-done">✓ Registrado en caja</span>
          </div>
        )}

        {/* ── FORMULARIO PACIENTE ── */}
        {mode === "form" && (
          <PatientForm
            onSubmit={handlePatientSubmit}
            onCancel={() => {
              if (!loading) {
                setMode("actions");
                setFormAction(null);
              }
            }}
          />
        )}

        {/* ── ACCIONES AGENDA ── */}
        {mode === "actions" && (
          <div className="modal-actions">

            {status === "reserved" && (
              <>
                <button
                  disabled={loading}
                  onClick={() => {
                    setMode("form");
                    setFormAction("confirm");
                  }}
                >
                  Confirmar paciente
                </button>
                <button className="danger" disabled={loading} onClick={onCancel}>
                  Anular reserva
                </button>
              </>
            )}

            {status === "confirmed" && (
              <>
                <button disabled={loading} onClick={onReschedule}>
                  Cambiar hora
                </button>
                <button className="danger" disabled={loading} onClick={onCancel}>
                  Anular cita
                </button>
              </>
            )}

          </div>
        )}

        <div className="modal-footer">
          <button disabled={loading} onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  );
}
