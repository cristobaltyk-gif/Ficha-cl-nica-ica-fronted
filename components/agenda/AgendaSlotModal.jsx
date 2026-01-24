export default function AgendaSlotModal({
  open,
  slot,
  onClose,
  onReserve,
  onConfirm,
  onCancel,
  onReschedule
}) {
  if (!open || !slot) return null;

  const { professional, time, status } = slot;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Hora {time}</h3>

        <p><strong>Profesional:</strong> {professional}</p>
        <p><strong>Estado:</strong> {status}</p>

        <div className="modal-actions">
          {status === "available" && (
            <button onClick={onReserve}>Reservar</button>
          )}

          {status === "reserved" && (
            <>
              <button onClick={onConfirm}>Confirmar</button>
              <button onClick={onCancel}>Anular</button>
            </>
          )}

          {status === "confirmed" && (
            <>
              <button onClick={onReschedule}>Cambiar hora</button>
              <button onClick={onCancel}>Anular</button>
            </>
          )}

          {status === "blocked" && (
            <button disabled>Horario bloqueado</button>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
