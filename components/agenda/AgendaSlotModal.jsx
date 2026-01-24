import { useState } from "react";
import PatientForm from "../patient/PatientForm";

export default function AgendaSlotModal({
  open,
  slot,
  onClose,
  onReserve,
  onConfirm,
  onCancel,
  onReschedule
}) {
  const [mode, setMode] = useState("actions"); // actions | form

  if (!open || !slot) return null;

  const { professional, time, status } = slot;

  const handlePatientSubmit = (patient) => {
    // por ahora solo reserva
    onReserve({
      slot,
      patient
    });
    setMode("actions");
  };

  const handleClose = () => {
    setMode("actions");
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">

        {/* ======================
            HEADER
           ====================== */}
        <h3>Hora {time}</h3>
        <p><strong>Profesional:</strong> {professional}</p>
        <p><strong>Estado:</strong> {status}</p>

        {/* ======================
            FORMULARIO PACIENTE
           ====================== */}
        {mode === "form" && (
          <PatientForm
            onSubmit={handlePatientSubmit}
            onCancel={() => setMode("actions")}
          />
        )}

        {/* ======================
            ACCIONES
           ====================== */}
        {mode === "actions" && (
          <div className="modal-actions">

            {status === "available" && (
              <button onClick={() => setMode("form")}>
                Reservar
              </button>
            )}

            {status === "reserved" && (
              <>
                <button onClick={() => setMode("form")}>
                  Confirmar
                </button>
                <button onClick={onCancel}>Anular</button>
              </>
            )}

            {status === "confirmed" && (
              <>
                <button onClick={onReschedule}>
                  Cambiar hora
                </button>
                <button onClick={onCancel}>Anular</button>
              </>
            )}

            {status === "blocked" && (
              <button disabled>Horario bloqueado</button>
            )}
          </div>
        )}

        {/* ======================
            FOOTER
           ====================== */}
        <div className="modal-footer">
          <button onClick={handleClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
