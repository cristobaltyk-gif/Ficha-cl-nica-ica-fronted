import { useState } from "react";
import { isValidRut, normalizeRut } from "../../utils/rut";
import "../../styles/pacientes/patient-form.css";

/*
PatientForm — UTILIDAD GLOBAL (CANÓNICO)

✔ Independiente del padre
✔ NO conoce agenda
✔ NO navega
✔ NO guarda directamente
✔ NO mockea datos
✔ SOLO gestiona paciente

FLUJO:
1) Pide RUT + botón buscar
2) (FUTURO) Llama backend ficha clínica (CONFIDENCIAL)
3) Si existe → muestra datos → Confirmar
4) Si no existe → expande formulario → Guardar
5) Emite datos al módulo llamador

IMPORTANTE:
- NO hay mock
- NO hay fetch activo
- El backend se implementará después
*/

export default function PatientForm({
  onConfirm, // paciente existente
  onCreate,  // paciente nuevo
  onCancel
}) {
  const [rut, setRut] = useState("");
  const [mode, setMode] = useState("search"); // search | edit | create
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // =========================
  // HELPERS
  // =========================
  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // =========================
  // BUSCAR PACIENTE (BACKEND)
  // =========================
  async function handleSearch() {
    setError(null);

    if (!rut || !isValidRut(rut)) {
      setError("RUT inválido");
      return;
    }

    const normalizedRut = normalizeRut(rut);
    setLoading(true);

    try {
      /*
      ==================================================
      🔐 BACKEND CONFIDENCIAL (PENDIENTE IMPLEMENTAR)
      ==================================================

      ⚠️ DATOS SENSIBLES / FICHA CLÍNICA
      - HTTPS obligatorio
      - Autenticación (token / sesión)
      - Backend valida permisos
      - No exponer datos en logs

      Endpoint sugerido:
      GET /patients/by-rut/:rut

      Ejemplo (NO IMPLEMENTADO):

      const res = await fetch(
        `${API_URL}/patients/by-rut/${normalizedRut}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();

      Respuesta esperada:
      {
        exists: boolean,
        patient?: {
          rut,
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          edad,
          direccion,
          telefono,
          email,
          prevision
        }
      }

      LÓGICA ESPERADA:
      if (data.exists) {
        setForm(data.patient);
        setMode("edit");
      } else {
        setForm({ ...form, rut: normalizedRut });
        setMode("create");
      }
      */

      // ⛔ Sin backend aún → no se decide nada aquí
      setError("Búsqueda de paciente aún no disponible");
    } catch {
      setError("Error al buscar paciente");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // CONFIRMAR / CREAR
  // =========================
  function handleSubmit() {
    setError(null);

    if (!form.nombre || !form.apellidoPaterno) {
      setError("Nombre y apellido paterno son obligatorios");
      return;
    }

    if (!form.edad || isNaN(form.edad)) {
      setError("Edad inválida");
      return;
    }

    const payload = {
      ...form,
      edad: Number(form.edad)
    };

    if (mode === "edit") {
      onConfirm?.(payload);
    }

    if (mode === "create") {
      onCreate?.(payload);
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="patient-form">

      {/* BUSCADOR */}
      <div className="patient-form-search">
        <input
          placeholder="RUT"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
        />
        <button
          className="search-btn"
          disabled={loading}
          onClick={handleSearch}
        >
          🔍
        </button>
      </div>

      {error && (
        <div className="patient-form-error">{error}</div>
      )}

      {(mode === "edit" || mode === "create") && (
        <>
          <h3>
            {mode === "edit"
              ? "Paciente encontrado"
              : "Nuevo paciente"}
          </h3>

          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => update("nombre", e.target.value)}
          />

          <input
            placeholder="Apellido paterno"
            value={form.apellidoPaterno}
            onChange={(e) =>
              update("apellidoPaterno", e.target.value)
            }
          />

          <input
            placeholder="Apellido materno"
            value={form.apellidoMaterno}
            onChange={(e) =>
              update("apellidoMaterno", e.target.value)
            }
          />

          <input
            placeholder="Edad"
            value={form.edad}
            onChange={(e) => update("edad", e.target.value)}
          />

          <div className="patient-form-actions">
            <button className="primary" onClick={handleSubmit}>
              {mode === "edit" ? "Confirmar" : "Guardar"}
            </button>

            <button className="secondary" onClick={onCancel}>
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
