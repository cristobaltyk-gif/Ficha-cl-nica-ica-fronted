import { useState } from "react";

/*
PatientForm (ADMINISTRATIVO – CANÓNICO)

- NO guarda
- NO llama backend
- NO conoce agenda
- SOLO:
  - valida datos mínimos
  - entrega objeto paciente
*/

export default function PatientForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    rut: "",
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    edad: "",
    direccion: "",
    telefono: "",
    email: "",
    prevision: ""
  });

  const [error, setError] = useState(null);

  // =========================
  // HANDLERS
  // =========================

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    setError(null);

    // ===== validaciones mínimas =====
    if (!form.rut || !form.nombre || !form.apellidoPaterno) {
      setError("RUT, nombre y apellido paterno son obligatorios");
      return;
    }

    if (!form.edad || isNaN(form.edad)) {
      setError("Edad inválida");
      return;
    }

    // entrega datos normalizados
    onSubmit({
      rut: form.rut.trim(),
      nombre: form.nombre.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      edad: Number(form.edad),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      prevision: form.prevision.trim()
    });
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div>
      <h3>Datos del paciente</h3>

      {error && <div>{error}</div>}

      <input
        placeholder="RUT"
        value={form.rut}
        onChange={(e) => update("rut", e.target.value)}
      />

      <input
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => update("nombre", e.target.value)}
      />

      <input
        placeholder="Apellido paterno"
        value={form.apellidoPaterno}
        onChange={(e) => update("apellidoPaterno", e.target.value)}
      />

      <input
        placeholder="Apellido materno"
        value={form.apellidoMaterno}
        onChange={(e) => update("apellidoMaterno", e.target.value)}
      />

      <input
        placeholder="Edad"
        value={form.edad}
        onChange={(e) => update("edad", e.target.value)}
      />

      <input
        placeholder="Dirección"
        value={form.direccion}
        onChange={(e) => update("direccion", e.target.value)}
      />

      <input
        placeholder="Teléfono"
        value={form.telefono}
        onChange={(e) => update("telefono", e.target.value)}
      />

      <input
        placeholder="Correo electrónico"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
      />

      <input
        placeholder="Previsión (Fonasa / Isapre / Particular)"
        value={form.prevision}
        onChange={(e) => update("prevision", e.target.value)}
      />

      <div>
        <button onClick={handleSubmit}>Guardar</button>
        <button onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
}
