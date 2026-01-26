import "../../styles/modal.css";
import { useState, useEffect } from "react";
import PatientForm from "../patient/PatientForm";

export default function AgendaSlotModal({
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

  // Reset al abrir/cerrar
  useEffect(() => {
    if (open) {
      setMode("actions");
      setFormAction(null);
    }
  }, [open]);

  if (!open || !slot) return null;

  const { professional, time, status } = slot;

  // =========================
  // Submit paciente
  // =========================
  const handlePatientSubmit = (patient) => {
    if (formAction === "reserve") {
      onReserve?.({ slot, patient });
    }

    if (formAction === "confirm") {
      onConfirm?.({ slot, patient });
    }

    setMode("actions");
    setFormAction(null);
  };

  // =========================
  // Close modal
  // =========================
  const handleClose = () => {
    if (loading) return;
    setMode("actions");
    setFormAction(null);
    onClose?.();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">

        {/* ======================
            HEADER
           ====================== */}
        <h3>🕒 Hora {time}</h3>

        <p>
          <strong>Profesional:</strong> {professional}
        </p>

        <p>
          <strong>Estado:</strong>{" "}
          {status === "available" && "Disponible"}
          {status === "reserved" && "Reservada"}
          {status === "confirmed" && "Confirmada"}
          {status === "blocked" && "Bloqueada"}
        </p>

        {/* ======================
            FORMULARIO PACIENTE
           ====================== */}
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

        {/* ======================
            ACCIONES
           ====================== */}
        {mode === "actions" && (
          <div className="modal-actions">

            {/* DISPONIBLE */}
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

            {/* RESERVADA */}
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

                <button disabled={loading} onClick={onCancel}>
                  Anular reserva
                </button>
              </>
            )}

            {/* CONFIRMADA */}
            {status === "confirmed" && (
              <>
                <button disabled={loading} onClick={onReschedule}>
                  Cambiar hora
                </button>

                <button disabled={loading} onClick={onCancel}>
                  Anular cita
                </button>
              </>
            )}

            {/* BLOQUEADA */}
            {status === "blocked" && (
              <button disabled>
                Horario bloqueado
              </button>
            )}
          </div>
        )}

        {/* ======================
            FOOTER
           ====================== */}
        <div className="modal-footer">
          <button disabled={loading} onClick={handleClose}>
            Cerrar
          </button>
        </div>

        {loading && (
          <p style={{ marginTop: 10, color: "#64748b" }}>
            Guardando…
          </p>
        )}
      </div>
    </div>
  );
}
