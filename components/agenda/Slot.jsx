export default function Slot({
  time,
  status = "available",
  onSelect
}) {
  const isClickable =
    status === "available" || status === "reserved" || status === "confirmed";

  const handleClick = () => {
    if (!isClickable) return;
    if (typeof onSelect === "function") {
      onSelect(time);
    }
  };

  return (
    <div
      className={`slot ${status}`}
      onClick={handleClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={(e) => {
        if (!isClickable) return;
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label={`Horario ${time}, estado ${status}`}
      aria-disabled={!isClickable}
    >
      <span className="slot-time">{time}</span>
    </div>
  );
}
