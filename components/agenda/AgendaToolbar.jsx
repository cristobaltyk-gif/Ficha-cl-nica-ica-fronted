import "../../styles/agenda/toolbar.css";

export default function AgendaToolbar({
  date,
  box,
  professionals,
  onDateChange,
  onBoxChange,
  onProfessionalsChange
}) {
  const PROFESSIONAL_OPTIONS = [
    { id: "cristobal_huerta", label: "Dr. Cristóbal Huerta" },
    { id: "jaime_espinoza", label: "Dr. Jaime Espinoza" }
  ];

  const selectedA = professionals?.[0] || "";
  const selectedB = professionals?.[1] || "";

  function handleSelectA(value) {
    if (!value) {
      onProfessionalsChange([]);
      return;
    }
    const next = [value];
    if (selectedB && selectedB !== value) next.push(selectedB);
    onProfessionalsChange(next.slice(0, 2));
  }

  function handleSelectB(value) {
    if (!selectedA) return;
    if (!value || value === selectedA) {
      onProfessionalsChange([selectedA]);
      return;
    }
    onProfessionalsChange([selectedA, value]);
  }

  return (
    <div className="agenda-toolbar">
      <div>
        <label>Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>

      <div>
        <label>Box</label>
        <select value={box} onChange={(e) => onBoxChange(e.target.value)}>
          <option value="">— Seleccionar —</option>
          <option value="box1">Box 1</option>
          <option value="box2">Box 2</option>
          <option value="box3">Box 3</option>
        </select>
      </div>

      <div>
        <label>Profesional</label>
        <select value={selectedA} onChange={(e) => handleSelectA(e.target.value)}>
          <option value="">— Seleccionar —</option>
          {PROFESSIONAL_OPTIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Segundo profesional</label>
        <select
          value={selectedB}
          onChange={(e) => handleSelectB(e.target.value)}
          disabled={!selectedA}
        >
          <option value="">— Ninguno —</option>
          {PROFESSIONAL_OPTIONS.filter((p) => p.id !== selectedA).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
