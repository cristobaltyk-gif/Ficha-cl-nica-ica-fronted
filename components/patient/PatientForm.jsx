import { useState } from "react";
import { isValidRut, normalizeRut } from "../../utils/rut";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/pacientes/patient-form.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function PatientForm({
  open = true,
  onConfirm,
  onCreate,
  onCancel
}) {
  if (!open) return null;

  // 🔐 FUENTE DE VERDAD
  const { session } = useAuth();
  const internalUser = session?.usuario;

  const [rut, setRut] = useState("");
  const [mode, setMode] = useState("search"); // search | edit | create
  const [isEditing, setIsEditing] = useState(false); // 👈 CLAVE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CONTRATO INTACTO
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

  function update(field, value) {
    if (!isEditing && mode === "edit") return; // 🔒 bloquea edición
    setForm(prev => ({ ...prev, [field]: value }));
  }

  // =========================
  // BUSCAR PACIENTE (READ)
  // =========================
  async function handleSearch() {
    setError(null);

    if (!internalUser) {
      setError("Sesión inválida");
      return;
    }

    if (!rut || !isValidRut(rut)) {
      setError("RUT inválido");
      return;
    }

    const normalizedRut = normalizeRut(rut);
    setLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/api/fichas/admin/${normalizedRut}`,
        { headers: { "X-Internal-User": internalUser } }
      );

      if (res.ok) {
        const data = await res.json();

        setForm({
          rut: data.rut ?? normalizedRut,
          nombre: data.nombre ?? "",
          apellidoPaterno: data.apellido_paterno ?? "",
          apellidoMaterno: data.apellido_materno ?? "",
          edad: data.edad ?? "",
          direccion: data.direccion ?? "",
          telefono: data.telefono ?? "",
          email: data.email ?? "",
          prevision: data.prevision ?? ""
        });

        setMode("edit");
        setIsEditing(false); // 👈 modo vista
        return;
      }

      if (res.status === 404) {
        setForm({
          rut: normalizedRut,
          nombre: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          edad: "",
          direccion: "",
          telefono: "",
          email: "",
          prevision: ""
        });

        setMode("create");
        setIsEditing(true);
        return;
      }

      setError("Error inesperado al buscar paciente");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // MODIFICAR / GUARDAR
  // =========================
  async function handleSubmit() {
    setError(null);

    // 👉 PRIMER CLICK EN EDIT → SOLO HABILITA INPUTS
    if (mode === "edit" && !isEditing) {
      setIsEditing(true);
      return;
    }

    // 👉 VALIDACIÓN REAL SOLO AL GUARDAR
    if (!form.nombre || !form.apellidoPaterno) {
      setError("Nombre y apellido paterno son obligatorios");
      return;
    }

    if (!form.edad || isNaN(form.edad)) {
      setError("Edad inválida");
      return;
    }

    const payload = {
      rut: form.rut,
      nombre: form.nombre,
      apellido_paterno: form.apellidoPaterno,
      apellido_materno: form.apellidoMaterno,
      edad: Number(form.edad),
      direccion: form.direccion,
      telefono: form.telefono,
      email: form.email,
      prevision: form.prevision
    };

    // =========================
    // UPDATE (PUT)
    // =========================
    if (mode === "edit") {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/fichas/admin/${form.rut}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-User": internalUser
            },
            body: JSON.stringify(payload)
          }
        );

        if (!res.ok) throw new Error();

        setIsEditing(false); // 👈 vuelve a vista
        onConfirm?.(payload);
      } catch {
        setError("Error al actualizar paciente");
      } finally {
        setLoading(false);
      }
      return;
    }

    // =========================
    // CREATE (POST)
    // =========================
    if (mode === "create") {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_URL}/api/fichas/admin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Internal-User": internalUser
            },
            body: JSON.stringify(payload)
          }
        );

        if (!res.ok) throw new Error();

        onCreate?.(payload);
      } catch {
        setError("Error al guardar paciente");
      } finally {
        setLoading(false);
      }
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="modal-overlay">
      <div className="modal-content patient-form">

        <div className="patient-form-search">
          <input
            placeholder="RUT"
            value={rut}
            onChange={e => setRut(e.target.value)}
          />
          <button className="search-btn" disabled={loading} onClick={handleSearch}>
            🔍
          </button>
        </div>

        {error && <div className="patient-form-error">{error}</div>}

        {(mode === "edit" || mode === "create") && (
          <>
            <h3>
              {mode === "edit"
                ? isEditing ? "Editando paciente" : "Paciente encontrado"
                : "Nuevo paciente"}
            </h3>

            <input placeholder="Nombre" value={form.nombre}
              onChange={e => update("nombre", e.target.value)} />

            <input placeholder="Apellido paterno" value={form.apellidoPaterno}
              onChange={e => update("apellidoPaterno", e.target.value)} />

            <input placeholder="Apellido materno" value={form.apellidoMaterno}
              onChange={e => update("apellidoMaterno", e.target.value)} />

            <input placeholder="Edad" value={form.edad}
              onChange={e => update("edad", e.target.value)} />

            <input placeholder="Dirección" value={form.direccion}
              onChange={e => update("direccion", e.target.value)} />

            <input placeholder="Teléfono" value={form.telefono}
              onChange={e => update("telefono", e.target.value)} />

            <input placeholder="Email" value={form.email}
              onChange={e => update("email", e.target.value)} />

            <input placeholder="Previsión" value={form.prevision}
              onChange={e => update("prevision", e.target.value)} />

            <div className="patient-form-actions">
              <button className="primary" onClick={handleSubmit} disabled={loading}>
                {mode === "edit"
                  ? isEditing ? "Guardar cambios" : "Modificar"
                  : "Guardar"}
              </button>

              <button className="secondary" onClick={onCancel} disabled={loading}>
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
