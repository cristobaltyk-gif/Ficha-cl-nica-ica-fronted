import "../../styles/agenda/slot.css";

export default function Slot({
  time,
  status = "available",
  patient,
  rut,
  onSelect,
  cajaStatus,
  horaLlegada,
  gratuito,
  gratuito_confirmado,
  gratuito_aceptado,
  sobrecupo,
  sobrecupo_confirmado,
  sobrecupo_aceptado,
  sobrecupo_gratuito,
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

  const slotClass = resolveSlotClass(
    status, cajaStatus,
    gratuito, gratuito_confirmado, gratuito_aceptado,
    sobrecupo, sobrecupo_confirmado, sobrecupo_aceptado
  );
  const slotLabel = resolveLabel(
    status, cajaStatus,
    gratuito, gratuito_confirmado, gratuito_aceptado,
    sobrecupo, sobrecupo_confirmado, sobrecupo_aceptado,
    horaLlegada
  );

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
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
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
          <span
            className={`slot-payment-icon slot-payment-icon--${
              (gratuito || sobrecupo_gratuito)
                ? "gratuito"
                : cajaStatus === "paid"
                ? "paid"
                : "waiting"
            }`}
            title={
              (gratuito || sobrecupo_gratuito)
                ? "Gratuito"
                : cajaStatus === "paid"
                ? "Pagado"
                : "Pendiente de pago"
            }
          >
            {(gratuito || sobrecupo_gratuito) ? "★" : "$"}
          </span>
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

function resolveSlotClass(
  status, cajaStatus,
  gratuito, gratuitoConfirmado, gratuitoAceptado,
  sobrecupo, sobrecupoConfirmado, sobrecupoAceptado
) {
  if (status === "available") return "slot-available";
  if (status === "blocked")   return "slot-blocked";
  if (status === "cancelled") return "slot-available";
  if (status === "evaluated") return "slot-evaluated";

  if (status === "reserved" || status === "confirmed") {
    if (gratuito && !sobrecupo) {
      if (gratuitoAceptado)   return "slot-gratuito-aceptado";
      if (gratuitoConfirmado) return "slot-gratuito-confirmado";
      return "slot-gratuito";
    }
    if (sobrecupo) {
      if (sobrecupoAceptado)   return "slot-gratuito-aceptado";
      if (sobrecupoConfirmado) return "slot-gratuito-confirmado";
      return "slot-gratuito";
    }
    if (cajaStatus === "paid")    return "slot-caja-paid";
    if (cajaStatus === "waiting") return "slot-caja-waiting";
    return `slot-${status}`;
  }

  return `slot-${status}`;
}

function resolveLabel(
  status, cajaStatus,
  gratuito, gratuitoConfirmado, gratuitoAceptado,
  sobrecupo, sobrecupoConfirmado, sobrecupoAceptado,
  horaLlegada
) {
  if (status === "available") return "Disponible";
  if (status === "blocked")   return "Bloqueada";
  if (status === "cancelled") return "Disponible";
  if (status === "evaluated") return "Atendido";

  if (status === "reserved" || status === "confirmed") {
    if (gratuito && !sobrecupo) {
      if (gratuitoAceptado)   return "Gratuito ✓";
      if (gratuitoConfirmado) return "Gratuito — pendiente médico";
      return "Gratuito — pendiente paciente";
    }
    if (sobrecupo) {
      if (sobrecupoAceptado)   return "Sobre cupo ✓";
      if (sobrecupoConfirmado) return "Sobre cupo — pendiente médico";
      return "Sobre cupo — pendiente paciente";
    }
    if (cajaStatus === "paid")    return horaLlegada ? `Pagado ✓ · Llegó ${horaLlegada}` : "Pagado ✓";
    if (cajaStatus === "waiting") return horaLlegada ? `Llegó ${horaLlegada}` : "En espera";
    return status === "confirmed" ? "Confirmada" : "Reservada";
  }

  return status;
}
