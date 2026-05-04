import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import DashboardAtencionPsicologia from "../pages/DashboardAtencionPsicologia.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

const API_URL = import.meta.env.VITE_API_URL;

export default function AtencionPsicologiaCerebro() {
  const { state }   = useLocation();
  const { session } = useAuth();
  const navigate    = useNavigate();
  const origin      = state?.origin;

  function handleBackNavigation() {
    if (origin === "pacientes") {
      navigate("/psicologo/pacientes", { replace: true, state: { rut: state.rut } });
      return;
    }
    if (origin === "agenda") { navigate(-1); return; }
    navigate("/psicologo", { replace: true });
  }

  if (!state || !state.rut || !state.date || !state.time || !state.professional) {
    return <div className="dashboard-placeholder">Atención inválida o acceso directo no permitido</div>;
  }

  const hoyISO = new Date().toISOString().slice(0, 10);
  const esHoy  = state.date === hoyISO;

  const [admin,            setAdmin]            = useState(null);
  const [adminError,       setAdminError]       = useState(null);
  const [professionalName, setProfessionalName] = useState("");
  const [professionalError,setProfessionalError]= useState(null);

  useEffect(() => {
    if (!state?.rut) return;
    async function loadAdmin() {
      try {
        const res = await fetch(`${API_URL}/api/fichas/admin/${state.rut}`,
          { headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario } });
        if (!res.ok) throw new Error();
        setAdmin(await res.json());
      } catch { setAdminError("No se pudo cargar ficha administrativa"); }
    }
    loadAdmin();
  }, [state?.rut, session?.usuario]);

  useEffect(() => {
    async function loadProfessional() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const prof = data.find(p => p.id === state.professional);
        if (!prof) { setProfessionalError("Profesional no autorizado"); return; }
        setProfessionalName(prof.name);
      } catch { setProfessionalError("No se pudo cargar profesional"); }
    }
    loadProfessional();
  }, [state.professional]);

  const [atencion,    setAtencion]    = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [ordering,    setOrdering]    = useState(false);

  const speech = useWebSpeech({
    lang: "es-CL",
    onChunk: (text) => {
      setAtencion(prev => (prev ? prev + "\n" + text : text));
    }
  });

  function handleDictado() {
    if (!speech.recording) speech.start(); else speech.stop();
  }

  async function handleOrdenarClinicamente() {
    const inputText = atencion.trim();
    if (!inputText) return;
    setOrdering(true);
    try {
      const res = await fetch(`${API_URL}/api/claude/clinical-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAtencion(data.atencion    || atencion);
      setDiagnostico(data.diagnostico || diagnostico);
    } catch {} finally { setOrdering(false); }
  }

  function calcularEdad(fn) {
    if (!fn) return "";
    const nac = new Date(fn), hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
  }

  async function handleGuardar() {
    if (!esHoy) { alert("Solo se puede guardar atención del día actual"); return; }
    try {
      const res = await fetch(`${API_URL}/api/fichas/evento`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({
          rut: admin.rut, fecha: state.date, hora: state.time,
          atencion, diagnostico,
          receta: "", examenes: "", indicaciones: "",
          orden_kinesiologia: "", indicacion_quirurgica: ""
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al guardar"); }
      alert("✅ Atención psicológica guardada correctamente");
      handleBackNavigation();
    } catch (e) { alert(e.message); }
  }

  async function handleModificar() {
    if (!esHoy) { alert("Solo se puede modificar atención del día actual"); return; }
    try {
      const res = await fetch(`${API_URL}/api/fichas/evento`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({
          rut: admin.rut, fecha: state.date, hora: state.time,
          atencion, diagnostico,
          receta: "", examenes: "", indicaciones: "",
          orden_kinesiologia: "", indicacion_quirurgica: ""
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al modificar"); }
      alert("✅ Atención psicológica modificada correctamente");
      handleBackNavigation();
    } catch (e) { alert(e.message); }
  }

  if (adminError)        return <div>{adminError}</div>;
  if (professionalError) return <div>{professionalError}</div>;
  if (!admin || !professionalName) return <div>Cargando información…</div>;

  return (
    <DashboardAtencionPsicologia
      rut={admin.rut}
      nombre={`${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}`}
      edad={calcularEdad(admin.fecha_nacimiento)}
      prevision={admin.prevision}
      date={state.date}
      time={state.time}
      professional={professionalName}
      atencion={atencion}
      diagnostico={diagnostico}
      onChangeAtencion={setAtencion}
      onChangeDiagnostico={setDiagnostico}
      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}
      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering}
      ordering={ordering}
      onGuardar={handleGuardar}
      onModificar={handleModificar}
      onCancelar={handleBackNavigation}
    />
  );
}
