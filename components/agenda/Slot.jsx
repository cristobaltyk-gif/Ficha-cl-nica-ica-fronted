export default function Slot({ time, status }) {
  return (
    <div className={`slot slot-${status}`}>
      <span className="slot-time">{time}</span>
    </div>
  );
}
