import { useState } from "react";
import { isValidRut, normalizeRut } from "../../utils/rut";
import { useAuth } from "../../auth/AuthContext";
import "../../styles/pacientes/patient-form.css";

const API_URL = import.meta.env.VITE_API_URL;

const ISAPRES = [
  "Banmédica", "Colmena", "Cruz Blanca", "Cruz del Norte",
  "Esencial", "MasVida", "Río Blanco", "San Lorenzo",
  "Vida Tres", "Otra",
];

export default function PatientForm({ open = true, onConfirm, onCreate, onCancel }) {
  if (!open) return null;

  const { session } = useAuth();
  const internalUser = session?.usuario;

  const [rut,          setRut]          = useState("");
  const [mode,         setMode]         = useState("search");
  const [isEditing,    setIsEditing]    = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [consentimiento, setConsentimiento] = useState(false);

  const [previsionTipo, setPrevisionTipo] = useState("");
  const [isapre,        setIsapre]        = useState("");
  const [otraIsapre,    setOtraIsapre]    = useState("");

  const [form, setForm] = useState({
    rut: "", nombre: "", apellidoPaterno: "", apellidoMaterno: "",
    fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "",
  });

  function update(field, value) {
    if (!isEditing && mode === "edit") return;
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function parsePrevisionFromData(prev) {
    if (!prev) { setPrevisionTipo(""); setIsapre(""); setOtraIsapre(""); return; }
    if (prev.startsWith("Isapre - ")) {
      const nombre = prev.replace("Isapre - ", "");
      setPrevisionTipo("Isapre");
      if (ISAPRES.includes(nombre)) { setIsapre(nombre); setOtraIsapre(""); }
      else { setIsapre("Otra"); setOtraIsapre(nombre); }
    } else if (prev === "Isapre") {
      setPrevisionTipo("Isapre"); setIsapre(""); setOtraIsapre("");
    } else if (["Fonasa","Particular","Otra"].includes(prev)) {
      setPrevisionTipo(prev); setIsapre(""); setOtraIsapre("");
    } else {
      setPrevisionTipo("Otra"); setIsapre(""); setOtraIsapre(prev);
    }
  }

  function getPrevisionFinal() {
    if (previsionTipo === "Isapre") {
      const n = isapre === "Otra" ? otraIsapre : isapre;
      return n ? `Isapre - ${n}` : "Isapre";
    }
    if (previsionTipo === "Otra" && otraIsapre.trim()) return otraIsapre.trim();
    return previsionTipo;
  }

  async function handleSearch() {
    setError(null);
    if (!internalUser) { setError("Sesión inválida"); return; }
    if (!rut || !isValidRut(rut)) { setError("RUT inválido"); return; }
    const normalizedRut = normalizeRut(rut);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/fichas/admin/${normalizedRut}`,
        { headers: { "X-Internal-User": internalUser } });
      if (res.ok) {
        const data = await res.json();
        setForm({
          rut: data.rut ?? normalizedRut,
          nombre: data.nombre ?? "",
          apellidoPaterno: data.apellido_paterno ?? "",
          apellidoMaterno: data.apellido_materno ?? "",
          fechaNacimiento: data.fecha_nacimiento ?? "",
          direccion: data.direccion ?? "",
          telefono: data.telefono ?? "",
          email: data.email ?? "",
          sexo: data.sexo ?? "",
        });
        parsePrevisionFromData(data.prevision);
        setMode("edit"); setIsEditing(false);
        return;
      }
      if (res.status === 404) {
        setForm({
          rut: normalizedRut, nombre: "", apellidoPaterno: "", apellidoMaterno: "",
          fechaNacimiento: "", direccion: "", telefono: "", email: "", sexo: "",
        });
        parsePrevisionFromData("");
        setMode("create"); setIsEditing(true);
        return;
      }
      setError("Error inesperado al buscar paciente");
    } catch { setError("Error de conexión con el servidor"); }
    finally { setLoading(false); }
  }

  function handleConfirmExisting() {
    onConfirm?.({
      rut: form.rut, nombre: form.nombre,
      apellido_paterno: form.apellidoPaterno, apellido_materno: form.apellidoMaterno,
      fecha_nacimiento: form.fechaNacimiento, direccion: form.direccion,
      telefono: form.telefono, email: form.email,
      prevision: getPrevisionFinal(), sexo: form.sexo,
    });
  }

  async function handleSubmit() {
    setError(null);
    if (mode === "edit" && !isEditing) { setIsEditing(true); return; }
    if (!form.nombre || !form.apellidoPaterno) { setError("Nombre y apellido paterno son obligatorios"); return; }
    if (!form.fechaNacimiento) { setError("Fecha de nacimiento obligatoria"); return; }
    if (previsionTipo === "Isapre" && !isapre) { setError("Seleccione una Isapre"); return; }
    if (previsionTipo === "Isapre" && isapre === "Otra" && !otraIsapre.trim()) { setError("Indique el nombre de la Isapre"); return; }

    // Consentimiento obligatorio solo al crear
    if (mode === "create" && !consentimiento) {
      setError("El paciente debe aceptar el consentimiento de datos para continuar");
      return;
    }

    const payload = {
      rut: form.rut, nombre: form.nombre,
      apellido_paterno: form.apellidoPaterno, apellido_materno: form.apellidoMaterno,
      fecha_nacimiento: form.fechaNacimiento, direccion: form.direccion,
      telefono: form.telefono, email: form.email,
      prevision: getPrevisionFinal(), sexo: form.sexo,
    };

    // Agregar consentimiento al crear
    if (mode === "create") {
      payload.consentimiento_datos     = true;
      payload.consentimiento_fecha     = new Date().toISOString().slice(0, 10);
      payload.consentimiento_registrado_por = internalUser;
    }

    if (mode === "edit") {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/fichas/admin/${form.rut}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "X-Internal-User": internalUser },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error();
        setIsEditing(false);
        onConfirm?.(payload);
      } catch { setError("Error al actualizar paciente"); }
      finally { setLoading(false); }
      return;
    }

    if (mode === "create") {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/fichas/admin`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Internal-User": internalUser },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error();
        onCreate?.(payload);
      } catch { setError("Error al guardar paciente"); }
      finally { setLoading(false); }
    }
  }

  const ro = mode === "edit" && !isEditing;

  return (
    <div className="modal-overlay">
      <div className="modal-content patient-form">

        <div className="patient-form-search">
          <input placeholder="RUT" value={rut} onChange={e => setRut(e.target.value)} />
          <button className="search-btn" disabled={loading} onClick={handleSearch}>🔍</button>
        </div>

        {error && <div className="patient-form-error">{error}</div>}

        {(mode === "edit" || mode === "create") && (
          <>
            <h3>
              {mode === "edit" ? isEditing ? "Editando paciente" : "Paciente encontrado" : "Nuevo paciente"}
            </h3>

            <input placeholder="Nombre" value={form.nombre} readOnly={ro}
              onChange={e => update("nombre", e.target.value)} />
            <input placeholder="Apellido paterno" value={form.apellidoPaterno} readOnly={ro}
              onChange={e => update("apellidoPaterno", e.target.value)} />
            <input placeholder="Apellido materno" value={form.apellidoMaterno} readOnly={ro}
              onChange={e => update("apellidoMaterno", e.target.value)} />
            <input type="date" placeholder="Fecha nacimiento" value={form.fechaNacimiento} readOnly={ro}
              onChange={e => update("fechaNacimiento", e.target.value)} />

            <select value={form.sexo} disabled={ro} onChange={e => update("sexo", e.target.value)}>
              <option value="">Sexo</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMENINO">Femenino</option>
            </select>

            <select value={previsionTipo} disabled={ro} onChange={e => {
              setPrevisionTipo(e.target.value); setIsapre(""); setOtraIsapre("");
            }}>
              <option value="">Previsión</option>
              <option value="Fonasa">Fonasa</option>
              <option value="Isapre">Isapre</option>
              <option value="Particular">Particular</option>
              <option value="Otra">Otra</option>
            </select>

            {previsionTipo === "Isapre" && (
              <>
                <select value={isapre} disabled={ro} onChange={e => setIsapre(e.target.value)}>
                  <option value="">¿Cuál Isapre?</option>
                  {ISAPRES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {isapre === "Otra" && (
                  <input placeholder="Nombre de la Isapre" value={otraIsapre} readOnly={ro}
                    onChange={e => setOtraIsapre(e.target.value)} />
                )}
              </>
            )}

            {previsionTipo === "Otra" && (
              <input placeholder="Especifique previsión" value={otraIsapre} readOnly={ro}
                onChange={e => setOtraIsapre(e.target.value)} />
            )}

            <input placeholder="Dirección" value={form.direccion} readOnly={ro}
              onChange={e => update("direccion", e.target.value)} />
            <input placeholder="Teléfono" value={form.telefono} readOnly={ro}
              onChange={e => update("telefono", e.target.value)} />
            <input placeholder="Email" value={form.email} readOnly={ro}
              onChange={e => update("email", e.target.value)} />

            {/* CONSENTIMIENTO — solo al crear */}
            {mode === "create" && (
              <div onClick={() => setConsentimiento(c => !c)} style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"12px 14px", marginTop:8,
                background: consentimiento ? "#f0fdf4" : "#f8fafc",
                border: `1px solid ${consentimiento ? "#86efac" : "#e2e8f0"}`,
                borderRadius:10, cursor:"pointer"
              }}>
                <div style={{
                  width:18, height:18, borderRadius:4, flexShrink:0, marginTop:1,
                  background: consentimiento ? "#16a34a" : "#fff",
                  border: `2px solid ${consentimiento ? "#16a34a" : "#cbd5e1"}`,
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  {consentimiento && <span style={{color:"#fff", fontSize:11, fontWeight:700}}>✓</span>}
                </div>
                <p style={{margin:0, fontSize:12, color:"#374151", lineHeight:1.5}}>
                  El paciente autoriza al Instituto de Cirugía Articular a almacenar y procesar
                  sus datos clínicos en formato digital, conforme a la{" "}
                  <strong>Ley 19.628</strong> de protección de datos personales.
                </p>
              </div>
            )}

            <div className="patient-form-actions">
              {mode === "edit" && !isEditing && (
                <>
                  <button className="primary" onClick={handleConfirmExisting}>Confirmar</button>
                  <button className="secondary danger" onClick={() => setIsEditing(true)}>Modificar</button>
                  <button className="secondary" onClick={onCancel}>Cancelar</button>
                </>
              )}
              {(mode === "create" || isEditing) && (
                <>
                  <button className="primary" onClick={handleSubmit} disabled={loading}>
                    {mode === "edit" ? "Guardar cambios" : "Guardar"}
                  </button>
                  <button className="secondary" onClick={onCancel}>Cancelar</button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
            }
                                                                              
