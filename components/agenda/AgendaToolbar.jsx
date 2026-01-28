import "../../styles/agenda/toolbar.css";

export default function AgendaToolbar({
  date,
  box,
  professionals, // ✅ [{id,name,...}]
  onDateChange,
  onBoxChange,
  onProfessionalsChange,
}) {
  // =========================
  // Selección actual (ID)
  // =========================
  const selectedId = professionals?.[0]?.id || "";

  // =========================
  // Handler selección
  // =========================
  function handleSelect(value) {
    if (!value) {
      onProfessionalsChange([]);
      return;
    }

    const prof = professionals.find((p) => p.id === value);
    if (prof) {
      // mantenemos array de objetos (contrato único)
      onProfessionalsChange([prof]);
    }
  }

  // =========================
  // Render
  // =========================
  return (
    <div className="agenda-toolbar">
      {/* Fecha */}
      <div className="toolbar-field">
        <label>Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      {/* Box */}
      <div className="toolbar-field">
        <label>Box</label>
        <select value={box} onChange={(e) => onBoxChange(e.target.value)}>
          <option value="">— Seleccionar —</option>
          <option value="box1">Box 1</option>
          <option value="box2">Box 2</option>
          <option value="box3">Box 3</option>
        </select>
      </div>

      {/* Profesional */}
      <div className="toolbar-field">
        <label>Profesional</label>
        <select value={selectedId} onChange={(e) => handleSelect(e.target.value)}>
          <option value="">— Seleccionar —</option>

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
