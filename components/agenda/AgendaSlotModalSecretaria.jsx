import "../../styles/modal.css";
import { useState, useEffect } from "react";
import PatientForm from "../patient/PatientForm";

/*
AgendaSlotModalSecretaria — PRODUCCIÓN REAL

✔ SOLO secretaría
✔ Reserva / confirma / anula
✔ NO rol
✔ NO navegación
*/

export default function AgendaSlotModalSecretaria({
  open,
  slot,
  loading = false,

  onClose,
  onReserve,
  onConfirm,
  onCancel,
  onReschedule
}) {
  const [mode, setMode] = useState("actions"); // actions | form
  const [formAction, setFormAction] = useState(null); // reserve | confirm

  useEffect(() => {
    if (open) {
      setMode("actions");
      setFormAction(null);
    }
  }, [open]);

  if (!open || !slot) return null;

  const { professional, time, status, patient } = slot;

  function handlePatientSubmit(patient) {
    if (formAction === "reserve") {
      onReserve?.({ slot, patient });
    }
    if (formAction === "confirm") {
      onConfirm?.({ slot, patient });
    }
    setMode("actions");
    setFormAction(null);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>🕒 Hora {time}</h3>

        <p><strong>Profesional:</strong> {professional}</p>
        {patient && (
          <p><strong>Paciente:</strong> {patient.nombre || patient.rut}</p>
        )}

        <p><strong>Estado:</strong> {status}</p>

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

        {mode === "actions" && (
          <div className="modal-actions">

            {status === "available" && (
              <button
                disabled={loading}
                onClick={() => {
                  setMode("form");
                  setFormAction("reserve");
                }}
              >
                Reservar paciente
              </button>
            )}

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

                <button
                  className="danger"
                  disabled={loading}
                  onClick={onCancel}
                >
                  Anular reserva
                </button>
              </>
            )}

            {status === "confirmed" && (
              <>
                <button disabled={loading} onClick={onReschedule}>
                  Cambiar hora
                </button>

                <button
                  className="danger"
                  disabled={loading}
                  onClick={onCancel}
                >
                  Anular cita
                </button>
              </>
            )}
          </div>
        )}

        <div className="modal-footer">
          <button disabled={loading} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
