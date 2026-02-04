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
    (patient || rut);

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
      <span className="slot-time">{time}</span>

      {showPatient && (
        <div className="slot-patient">
          <span className="slot-patient-name">
            {patient?.nombre || "Paciente"}
          </span>
          <span className="slot-patient-rut">
            {patient?.rut || rut}
          </span>
        </div>
      )}
    </div>
  );
}
