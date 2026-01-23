export default function Slot({ time, status = "free", onSelect }) {
  const handleClick = () => {
    if (typeof onSelect === "function") {
      onSelect(time);
    }
  };

  return (
    <div
      className={`slot slot-${status}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label={`Horario ${time} estado ${status}`}
    >
      <span className="slot-time">{time}</span>
    </div>
  );
}
