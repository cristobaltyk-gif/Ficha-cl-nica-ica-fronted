export default function Slot({ time, status }) {
  return (
    <div className={`slot slot-${status}`}>
      <span>{time}</span>
    </div>
  );
}
