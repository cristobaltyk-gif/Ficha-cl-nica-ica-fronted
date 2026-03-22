import "../../styles/agenda/slot.css";

export default function Slot({
  time,
  status = "available",
  patient,
  rut,
  onSelect
}) {
  const isClickable =
    status === "available" ||
    status === "reserved"  ||
    status === "confirmed";

  const showPatient =
    (status === "reserved" || status === "confirmed") &&
    (patient?.nombre || patient?.rut || rut);

  const handleClick = () => {
    if (!isClickable) return;
    onSelect?.(time);
  };

  const statusLabel = {
    available:  "Disponible",
    reserved:   "Reservada",
    confirmed:  "Confirmada",
    blocked:    "Bloqueada",
    cancelled:  "Cancelada",
  }[status] ?? status;

  return (
    <div
      className={`slot slot-${status}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-disabled={!isClickable}
    >
      <div className="slot-left">
        <span className="slot-time">{time}</span>
        <span className="slot-label">{statusLabel}</span>
      </div>

      {showPatient ? (
        <div className="slot-patient">
          {patient?.nombre && (
            <span className="slot-patient-name">
              {patient.nombre} {patient?.apellido_paterno ?? ""}
            </span>
          )}
          {(patient?.rut || rut) && (
            <span className="slot-patient-rut">{patient?.rut || rut}</span>
          )}
        </div>
      ) : (
        isClickable && status === "available" && (
          <span className="slot-cta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </span>
        )
      )}
    </div>
  );
}
