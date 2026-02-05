import "../../styles/agenda/agenda-slot-modal.css";

/*
AgendaSlotModalMedico — PRODUCCIÓN REAL

✔ SOLO médico
✔ Atender / No contesta / Anular
✔ NO backend
✔ NO formularios
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

  const { professional, time, patient, status } = slot;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>🕒 Hora {time}</h3>

        <p><strong>Profesional:</strong> {professional}</p>
        {patient && (
          <p><strong>Paciente:</strong> {patient.nombre || patient.rut}</p>
        )}

        <p><strong>Estado:</strong> {status}</p>

        <div className="modal-actions">
          <button
            className="primary"
            disabled={loading}
            onClick={() => onAttend?.(slot)}
          >
            Atender
          </button>

          <button
            disabled={loading}
            onClick={() => onNoShow?.(slot)}
          >
            No contesta
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
