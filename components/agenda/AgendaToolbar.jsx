import "../../styles/agenda/toolbar.css";
import { useState, useEffect } from "react";

export default function AgendaToolbar({
  date,
  box,
  professionals, // lista COMPLETA
  onDateChange,
  onBoxChange,
  onProfessionalsChange,
}) {
  // =========================
  // FECHA LOCAL (ANTI-COLAPSO)
  // =========================
  const [localDate, setLocalDate] = useState(date || "");

  // Mantener sincronía si el padre cambia la fecha
  useEffect(() => {
    setLocalDate(date || "");
  }, [date]);

  function handleDateChange(value) {
    setLocalDate(value);

    // 🔒 Emitir SOLO si es una fecha válida y distinta
    if (value && value !== date) {
      onDateChange?.(value);
    }
  }

  // =========================
  // PROFESIONALES
  // =========================
  function handleSelectProfessional(value) {
    if (!value) {
      // “Todos” → devolver lista completa (como ya usabas)
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
      <div className="toolbar-field">
        <label>Fecha</label>
        <input
          type="date"
          value={localDate}
          onChange={(e) => handleDateChange(e.target.value)}
        />
      </div>

      <div className="toolbar-field">
        <label>Box</label>
        <select
          value={box}
          onChange={(e) => onBoxChange?.(e.target.value)}
        >
          <option value="">— Seleccionar —</option>
          <option value="box1">Box 1</option>
          <option value="box2">Box 2</option>
          <option value="box3">Box 3</option>
        </select>
      </div>

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
