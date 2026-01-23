import { useEffect, useMemo, useState } from "react";
import Slot from "./Slot";
import "../../styles/agenda/agenda.css";

/**
 * Agenda (UI pura + estado local)
 * - NO define profesionales/horarios/agenda dentro del archivo
 * - Recibe todo por props (bien al tiro)
 *
 * props:
 *  - professionals: [{ id, name }]
 *  - hours: ["08:00", "08:30", ...]
 *  - initialStatus: { [professionalName]: { [hour]: "free"|"busy"|"blocked" } }
 *  - onChangeStatus?: (nextStatusMap) => void   // opcional (futuro backend)
 */
export default function Agenda({
  professionals = [],
  hours = [],
  initialStatus = {},
  onChangeStatus,
}) {
  const hasData = professionals.length > 0 && hours.length > 0;

  // Estado local (para interacción). Se inicializa desde props.
  const [statusMap, setStatusMap] = useState(initialStatus);
  const [selected, setSelected] = useState(null);
  // selected = { professionalName, hour, status }

  // Si cambian los datos desde arriba (ej: cambias fecha/profesional),
  // reiniciamos el mapa (sin mezclar estados antiguos).
  useEffect(() => {
    setStatusMap(initialStatus || {});
    setSelected(null);
  }, [initialStatus]);

  const getStatus = (professionalName, hour) =>
    statusMap?.[professionalName]?.[hour] || "free";

  const handleSelect = (professionalName, hour) => {
    setSelected({
      professionalName,
      hour,
      status: getStatus(professionalName, hour),
    });
  };

  const updateStatus = (newStatus) => {
    if (!selected) return;

    setStatusMap((prev) => {
      const next = {
        ...prev,
        [selected.professionalName]: {
          ...(prev[selected.professionalName] || {}),
          [selected.hour]: newStatus,
        },
      };

      // hook opcional para persistir (backend después)
      if (typeof onChangeStatus === "function") {
        onChangeStatus(next);
      }

      return next;
    });

    setSelected(null);
  };

  if (!hasData) {
    return (
      <div className="agenda-empty">
        Agenda sin datos (selecciona profesional y horario)
      </div>
    );
  }

  return (
    <>
      <div className="agenda">
        {professionals.map((p) => (
          <div key={p.id} className="agenda-column">
            <h3 className="agenda-title">{p.name}</h3>

            {hours.map((h) => (
              <Slot
                key={`${p.id}-${h}`}
                time={h}
                status={getStatus(p.name, h)}
                onSelect={() => handleSelect(p.name, h)}
              />
            ))}
          </div>
        ))}
      </div>

      {selected && (
        <div className="slot-actions">
          <strong>
            {selected.professionalName} · {selected.hour}
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
              <button type="button">👁️ Ver atención</button>
              <button type="button">💳 Registrar pago</button>
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
