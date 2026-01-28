import "../../styles/agenda/toolbar.css";

export default function AgendaToolbar({
  date,
  box,
  professionals, // lista COMPLETA
  onDateChange,
  onBoxChange,
  onProfessionalsChange,
}) {
  // =========================
  // Handler selección
  // =========================
  function handleSelect(value) {
    if (!value) {
      // NO destruir la lista
      onProfessionalsChange(professionals);
      return;
    }

    const prof = professionals.find((p) => p.id === value);
    if (prof) {
      onProfessionalsChange([prof]);
    }
  }

  // =========================
  // Render
  // =========================
  return (
    <div className="agenda-toolbar">
      <div className="toolbar-field">
        <label>Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div className="toolbar-field">
        <label>Box</label>
        <select value={box} onChange={(e) => onBoxChange(e.target.value)}>
          <option value="">— Seleccionar —</option>
          <option value="box1">Box 1</option>
          <option value="box2">Box 2</option>
          <option value="box3">Box 3</option>
        </select>
      </div>

      <div className="toolbar-field">
        <label>Profesional</label>
        <select onChange={(e) => handleSelect(e.target.value)}>
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
