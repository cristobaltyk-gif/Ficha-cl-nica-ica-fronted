import "../../styles/agenda/agenda-slot-modal.css";

/*
AgendaSlotModalMedico — PRODUCCIÓN REAL

✔ SOLO médico
✔ Atender / Anular
✔ UI pura
*/

export default function AgendaSlotModalMedico({
  open,
  slot,
  loading = false,

  onClose,
  onAttend,
  onNoShow,
  onCancel
}) {
  if (!open || !slot) return null;

  const {
    professional,
    professionalName, // ✅ nombre humano
    time,
    patient,
    status
  } = slot;

  const pacienteNombreCompleto = patient
    ? [
        patient.nombre,
        patient.apellido_paterno,
        patient.apellido_materno
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>🕒 Hora {time}</h3>

        <p>
          <strong>Profesional:</strong>{" "}
          {professionalName || professional}
        </p>

        {patient && (
          <p>
            <strong>Paciente:</strong>{" "}
            {pacienteNombreCompleto || patient.rut}
          </p>
        )}

        <p>
          <strong>Estado:</strong> {status}
        </p>

        <div className="modal-actions">
          <button
            className="primary"
            disabled={loading}
            onClick={() => onAttend?.(slot)}
          >
            Atender
          </button>

          <button
            className="danger"
            disabled={loading}
            onClick={() => onCancel?.(slot)}
          >
            Anular cita
          </button>
        </div>

        <div className="modal-footer">
          <button disabled={loading} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
