import Slot from "./Slot";
import "./agenda.css";

const HOURS = [
  "08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30",
  "12:00","12:30"
];

// MOCK profesionales
const PROFESSIONALS = [
  { id: 1, name: "Dr. Huerta" },
  { id: 2, name: "Dr. Espinoza" }
];

// MOCK agenda
const MOCK_STATUS = {
  "Dr. Huerta": {
    "08:00": "free",
    "08:30": "blocked",
    "09:00": "busy",
    "09:30": "free"
  },
  "Dr. Espinoza": {
    "08:00": "busy",
    "08:30": "free",
    "09:00": "free",
    "09:30": "blocked"
  }
};

export default function Agenda() {
  return (
    <div className="agenda">
      {PROFESSIONALS.map((p) => (
        <div key={p.id} className="agenda-column">
          <h3>{p.name}</h3>

          {HOURS.map((h) => (
            <Slot
              key={h}
              time={h}
              status={MOCK_STATUS[p.name]?.[h] || "free"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
