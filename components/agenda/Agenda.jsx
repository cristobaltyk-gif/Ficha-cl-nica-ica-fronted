import { useState } from "react";
import Slot from "./Slot";
import "../../styles/agenda/agenda.css";

const HOURS = [
  "08:00","08:30","09:00","09:30",
  "10:00","10:30","11:00","11:30",
  "12:00","12:30"
];

const PROFESSIONALS = [
  { id: 1, name: "Dr. Huerta" },
  { id: 2, name: "Dr. Espinoza" }
];

const INITIAL_STATUS = {
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
  const [statusMap, setStatusMap] = useState(INITIAL_STATUS);
  const [selected, setSelected] = useState(null);
  // selected = { professional, hour, status }

  const handleSelect = (professional, hour) => {
    setSelected({
      professional,
      hour,
      status: statusMap[professional]?.[hour] || "free"
    });
  };

  const updateStatus = (newStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [selected.professional]: {
        ...prev[selected.professional],
        [selected.hour]: newStatus
      }
    }));
    setSelected(null);
  };

  return (
    <>
      <div className="agenda">
        {PROFESSIONALS.map((p) => (
          <div key={p.id} className="agenda-column">
            <h3 className="agenda-title">{p.name}</h3>

            {HOURS.map((h) => (
              <Slot
                key={`${p.id}-${h}`}
                time={h}
                status={statusMap[p.name]?.[h] || "free"}
                onSelect={(hour) => handleSelect(p.name, hour)}
              />
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <div className="slot-actions">
          <strong>
            {selected.professional} · {selected.hour}
          </strong>

          {selected.status === "free" && (
            <>
              <button onClick={() => updateStatus("blocked")}>
                🚫 Bloquear horario
              </button>
              <button onClick={() => updateStatus("busy")}>
                🩺 Crear atención
              </button>
            </>
          )}

          {selected.status === "blocked" && (
            <button onClick={() => updateStatus("free")}>
              🔓 Liberar horario
            </button>
          )}

          {selected.status === "busy" && (
            <>
              <button>👁️ Ver atención</button>
              <button>💳 Registrar pago</button>
            </>
          )}

          <button className="cancel" onClick={() => setSelected(null)}>
            Cancelar
          </button>
        </div>
      )}
    </>
  );
}
