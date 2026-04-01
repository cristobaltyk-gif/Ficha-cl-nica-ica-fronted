import "../../styles/agenda/slot.css";

export default function Slot({
  time,
  status = "available",
  patient,
  rut,
  onSelect,
  cajaStatus,
  gratuito,
  gratuito_confirmado,
  gratuito_aceptado,
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

  const slotClass  = resolveSlotClass(status, cajaStatus, gratuito, gratuito_confirmado, gratuito_aceptado);
  const slotLabel  = resolveLabel(status, cajaStatus, gratuito, gratuito_confirmado, gratuito_aceptado);

  return (
    <div
      className={`slot ${slotClass}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-disabled={!isClickable}
    >
      <div className="slot-left">
        <span className="slot-time">{time}</span>
        <span className="slot-label">{slotLabel}</span>
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

function resolveSlotClass(status, cajaStatus, gratuito, gratuitoConfirmado, gratuitoAceptado) {
  if (status === "available") return "slot-available";
  if (status === "blocked")   return "slot-blocked";
  if (status === "cancelled") return "slot-cancelled";

  if (status === "reserved" || status === "confirmed") {
    if (gratuito) {
      if (gratuitoAceptado)   return "slot-gratuito-aceptado";
      if (gratuitoConfirmado) return "slot-gratuito-confirmado";
      return "slot-gratuito";
    }
    if (cajaStatus === "paid")    return "slot-caja-paid";
    if (cajaStatus === "waiting") return "slot-caja-waiting";
    return `slot-${status}`;
  }

  return `slot-${status}`;
}

function resolveLabel(status, cajaStatus, gratuito, gratuitoConfirmado, gratuitoAceptado) {
  if (status === "available") return "Disponible";
  if (status === "blocked")   return "Bloqueada";
  if (status === "cancelled") return "Cancelada";

  if (status === "reserved" || status === "confirmed") {
    if (gratuito) {
      if (gratuitoAceptado)   return "Gratuito ✓";
      if (gratuitoConfirmado) return "Gratuito — pendiente médico";
      return "Gratuito — pendiente paciente";
    }
    if (cajaStatus === "paid")    return "Pagado ✓";
    if (cajaStatus === "waiting") return "En espera";
    return status === "confirmed" ? "Confirmada" : "Reservada";
  }

  return status;
}
