import "../../styles/agenda/toolbar.css";
import { useState, useEffect } from "react";

export default function AgendaToolbar({
  date,
  professionals, // lista COMPLETA [{ id, name }]
  onDateChange,
  onProfessionalsChange,
}) {
  // =========================
  // FECHA LOCAL (ANTI-COLAPSO)
  // =========================
  const [localDate, setLocalDate] = useState(date || "");

  // sincronía si el padre cambia fecha
  useEffect(() => {
    setLocalDate(date || "");
  }, [date]);

  function handleDateChange(value) {
    setLocalDate(value);

    if (value && value !== date) {
      onDateChange?.(value);
    }
  }

  // =========================
  // PROFESIONALES
  // =========================
  function handleSelectProfessional(value) {
    if (!value) {
      // “Todos”
      onProfessionalsChange?.(professionals);
      return;
    }

    const prof = professionals.find((p) => p.id === value);
    if (prof) {
      onProfessionalsChange?.([prof]);
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="agenda-toolbar">
      {/* FECHA */}
      <div className="toolbar-field">
        <label>Fecha</label>
        <input
          type="date"
          value={localDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      {/* PROFESIONAL */}
      <div className="toolbar-field">
        <label>Profesional</label>
        <select onChange={(e) => handleSelectProfessional(e.target.value)}>
          <option value="">— Todos —</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
