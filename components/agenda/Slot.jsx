export default function Slot({
  time,
  status = "available",
  patient,
  rut,
  onSelect
}) {
  const isClickable =
    status === "available" ||
    status === "reserved" ||
    status === "confirmed";

  const showPatient =
    (status === "reserved" || status === "confirmed") &&
    (patient?.nombre || patient?.rut || rut);

  const handleClick = () => {
    if (!isClickable) return;
    onSelect?.(time);
  };

  return (
    <div
      className={`slot slot-${status}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      aria-disabled={!isClickable}
    >
      {/* Hora */}
      <span className="slot-time">{time}</span>

      {/* Nombre + Rut (SIN palabra Paciente) */}
      {showPatient && (
        <div className="slot-patient">
          {patient?.nombre && (
            <span className="slot-patient-name">
              {patient.nombre}
            </span>
          )}

          {(patient?.rut || rut) && (
            <span className="slot-patient-rut">
              {patient?.rut || rut}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
