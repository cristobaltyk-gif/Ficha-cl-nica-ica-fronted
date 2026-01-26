export default function Slot({
  time,
  status = "available",
  disabled = false,
  label = null,
  onSelect
}) {
  const isClickable =
    !disabled &&
    (status === "available" ||
      status === "reserved" ||
      status === "confirmed");

  function handleClick() {
    if (!isClickable) return;
    onSelect?.();
  }

  return (
    <div
      className={`slot slot-${status}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      title={label || ""}
      aria-label={`Horario ${time}, estado ${status}`}
      aria-disabled={!isClickable}
      style={{
        cursor: isClickable ? "pointer" : "not-allowed",
        opacity: disabled ? 0.6 : 1
      }}
      onKeyDown={(e) => {
        if (!isClickable) return;
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <span className="slot-time">{time}</span>
    </div>
  );
}
