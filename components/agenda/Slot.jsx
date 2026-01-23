export default function Slot({ time, status, onSelect }) {
  return (
    <div
      className={`slot slot-${status}`}
      onClick={() => onSelect(time)}
      role="button"
      tabIndex={0}
    >
      <span className="slot-time">{time}</span>
    </div>
  );
}
