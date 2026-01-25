import { useState } from "react";
import { isValidRut, normalizeRut } from "../../utils/rut";
import "../../styles/pacientes/patient-form.css";

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

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    setError(null);

    if (!form.rut) {
      setError("RUT es obligatorio");
      return;
    }

    if (!isValidRut(form.rut)) {
      setError("RUT inválido");
      return;
    }

    if (!form.nombre || !form.apellidoPaterno) {
      setError("Nombre y apellido paterno son obligatorios");
      return;
    }

    if (!form.edad || isNaN(form.edad) || Number(form.edad) <= 0) {
      setError("Edad inválida");
      return;
    }

    onSubmit({
      rut: normalizeRut(form.rut),
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

  return (
    <div className="patient-form">
      <h3>Datos del paciente</h3>

      {error && (
        <div className="patient-form-error">{error}</div>
      )}

      <div className="patient-form-group">
        <label>RUT</label>
        <input
          value={form.rut}
          onChange={(e) => update("rut", e.target.value)}
        />
      </div>

      <div className="patient-form-group">
        <label>Nombre</label>
        <input
          value={form.nombre}
          onChange={(e) => update("nombre", e.target.value)}
        />
      </div>

      <div className="patient-form-row">
        <div className="patient-form-group">
          <label>Apellido paterno</label>
          <input
            value={form.apellidoPaterno}
            onChange={(e) =>
              update("apellidoPaterno", e.target.value)
            }
          />
        </div>

        <div className="patient-form-group">
          <label>Apellido materno</label>
          <input
            value={form.apellidoMaterno}
            onChange={(e) =>
              update("apellidoMaterno", e.target.value)
            }
          />
        </div>
      </div>

      <div className="patient-form-group">
        <label>Edad</label>
        <input
          value={form.edad}
          onChange={(e) => update("edad", e.target.value)}
        />
      </div>

      <div className="patient-form-group">
        <label>Dirección</label>
        <input
          value={form.direccion}
          onChange={(e) =>
            update("direccion", e.target.value)
          }
        />
      </div>

      <div className="patient-form-row">
        <div className="patient-form-group">
          <label>Teléfono</label>
          <input
            value={form.telefono}
            onChange={(e) =>
              update("telefono", e.target.value)
            }
          />
        </div>

        <div className="patient-form-group">
          <label>Email</label>
          <input
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
      </div>

      <div className="patient-form-group">
        <label>Previsión</label>
        <input
          value={form.prevision}
          onChange={(e) =>
            update("prevision", e.target.value)
          }
        />
      </div>

      <div className="patient-form-actions">
        <button className="primary" onClick={handleSubmit}>
          Guardar
        </button>
        <button className="secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
          }
