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
  sobrecupo,
  sobrecupo_confirmado,
  sobrecupo_aceptado,
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
    sobrecupo, sobrecupo_confirmado, sobrecupo_aceptado
  );

  const paymentIcon = resolvePaymentIcon(
    status, cajaStatus,
    gratuito, sobrecupo, sobrecupo_confirmado, sobrecupo_aceptado
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

      {/* Ícono de pago */}
      {paymentIcon && (
        <span className={`slot-payment-icon slot-payment-icon--${paymentIcon.type}`}
          title={paymentIcon.label}>
          {paymentIcon.symbol}
        </span>
      )}
    </div>
  );
}

function resolvePaymentIcon(status, cajaStatus, gratuito, sobrecupo, sobrecupoConfirmado, sobrecupoAceptado) {
  if (status !== "reserved" && status !== "confirmed") return null;

  // Gratuito
  if (gratuito && !sobrecupo) return { type: "gratuito", symbol: "★", label: "Gratuito" };
  if (sobrecupo) {
    const esGratuito = /* sobrecupo_gratuito */ false; // se puede extender
    if (esGratuito) return { type: "gratuito", symbol: "★", label: "Sobre cupo gratuito" };
  }

  // Pago
  if (cajaStatus === "paid")    return { type: "paid",    symbol: "$", label: "Pagado" };
  if (cajaStatus === "waiting") return { type: "waiting", symbol: "$", label: "Pendiente de pago" };

  return null;
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
  sobrecupo, sobrecupoConfirmado, sobrecupoAceptado
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
    if (cajaStatus === "paid")    return "Pagado ✓";
    if (cajaStatus === "waiting") return "En espera";
    return status === "confirmed" ? "Confirmada" : "Reservada";
  }

  return status;
}
