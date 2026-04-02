import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import DashboardAtencionKine from "../pages/DashboardAtencionKine.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

const API_URL = import.meta.env.VITE_API_URL;

export default function AtencionKineCerebro() {
  const { state }   = useLocation();
  const { session } = useAuth();
  const navigate    = useNavigate();
  const origin      = state?.origin;

  function handleBackNavigation() {
    if (origin === "pacientes") {
      navigate("/kine/pacientes", { replace: true, state: { rut: state.rut } });
      return;
    }
    if (origin === "agenda") {
      navigate(-1);
      return;
    }
    navigate("/kine", { replace: true });
  }

  if (!state || !state.rut || !state.date || !state.time || !state.professional) {
    return <div className="dashboard-placeholder">Atención inválida o acceso directo no permitido</div>;
  }

  const hoy    = new Date();
  const hoyISO = hoy.toISOString().slice(0, 10);
  const esHoy  = state.date === hoyISO;

  const [admin,             setAdmin]             = useState(null);
  const [adminError,        setAdminError]        = useState(null);
  const [professionalName,  setProfessionalName]  = useState("");
  const [professionalError, setProfessionalError] = useState(null);

  useEffect(() => {
    if (!state?.rut) return;
    async function loadAdmin() {
      try {
        const res = await fetch(
          `${API_URL}/api/fichas/admin/${state.rut}`,
          { headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario } }
        );
        if (!res.ok) throw new Error();
        setAdmin(await res.json());
      } catch {
        setAdminError("No se pudo cargar ficha administrativa");
      }
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
      } catch {
        setProfessionalError("No se pudo cargar profesional");
      }
    }
    loadProfessional();
  }, [state.professional]);

  const [atencion,        setAtencion]        = useState("");
  const [examenFisico,    setExamenFisico]    = useState("");
  const [diagnostico,     setDiagnostico]     = useState("");
  const [planTratamiento, setPlanTratamiento] = useState("");

  const [ordering,   setOrdering]   = useState(false);
  const [orderError, setOrderError] = useState(null);

  const speech = useWebSpeech({
    lang: "es-CL",
    onChunk: (text) => {
      setAtencion(prev => (prev ? prev + "\n" + text : text));
    }
  });

  function handleDictado() {
    if (!speech.recording) speech.start();
    else speech.stop();
  }

  async function handleOrdenarClinicamente() {
    const inputText = atencion.trim();
    if (!inputText) { setOrderError("No hay texto para ordenar"); return; }
    setOrdering(true);
    setOrderError(null);
    try {
      const res = await fetch(`${API_URL}/api/claude/kine-order`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ text: inputText })
      });
      if (!res.ok) throw new Error("CLAUDE_ERROR");
      const data = await res.json();
      setAtencion(data.atencion                || atencion);
      setExamenFisico(data.examen_fisico       || examenFisico);
      setDiagnostico(data.diagnostico          || diagnostico);
      setPlanTratamiento(data.plan_tratamiento || planTratamiento);
    } catch {
      setOrderError("No se pudo ordenar clínicamente");
    } finally {
      setOrdering(false);
    }
  }

  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  async function openPdf(payload) {
    try {
      const res = await fetch(`${API_URL}/api/pdf/kinesiologia`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body:    JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch (e) {
      console.error("❌ ERROR PDF:", e);
    }
  }

  function buildPayload() {
    return {
      nombre:           admin.nombre,
      apellido_paterno: admin.apellido_paterno,
      apellido_materno: admin.apellido_materno,
      fecha_nacimiento: admin.fecha_nacimiento,
      edad:             edadCalculada,
      rut:              admin.rut,
      diagnostico,
      lado:             "",
      indicaciones:     `${atencion}\n\nExamen físico:\n${examenFisico}\n\nPlan de tratamiento:\n${planTratamiento}`
    };
  }

  function handleImprimir() {
    openPdf(buildPayload());
  }

  async function handleGuardar() {
    if (!esHoy) { alert("Solo se puede guardar atención del día actual"); return; }
    try {
      const res = await fetch(`${API_URL}/api/fichas/evento`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body:    JSON.stringify({
          rut:                   admin.rut,
          fecha:                 state.date,
          hora:                  state.time,
          atencion,
          diagnostico,
          examen_fisico:         examenFisico,
          plan_tratamiento:      planTratamiento,
          receta:                "",
          examenes:              "",
          indicaciones:          planTratamiento,
          orden_kinesiologia:    "",
          indicacion_quirurgica: ""
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al guardar"); }

      if (atencion.trim() || diagnostico.trim()) await openPdf(buildPayload());

      const emailPaciente = admin.email?.trim();
      if (emailPaciente && (atencion.trim() || diagnostico.trim())) {
        try {
          await fetch(`${API_URL}/api/pdf/enviar-email`, {
            method:  "POST",
            headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
            body:    JSON.stringify({
              email:              emailPaciente,
              nombre_paciente:    `${admin.nombre} ${admin.apellido_paterno}`.trim(),
              fecha:              state.date,
              profesional_nombre: professionalName,
              kinesiologia:       buildPayload()
            })
          });
        } catch {}
      }

      alert("✅ Atención kinésica guardada correctamente");
      handleBackNavigation();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleModificar() {
    if (!esHoy) { alert("Solo se puede modificar atención del día actual"); return; }
    try {
      const res = await fetch(`${API_URL}/api/fichas/evento`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body:    JSON.stringify({
          rut:                   admin.rut,
          fecha:                 state.date,
          hora:                  state.time,
          atencion,
          diagnostico,
          examen_fisico:         examenFisico,
          plan_tratamiento:      planTratamiento,
          receta:                "",
          examenes:              "",
          indicaciones:          planTratamiento,
          orden_kinesiologia:    "",
          indicacion_quirurgica: ""
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al modificar"); }
      alert("✅ Atención kinésica modificada correctamente");
      handleBackNavigation();
    } catch (e) {
      alert(e.message);
    }
  }

  if (adminError)        return <div>{adminError}</div>;
  if (professionalError) return <div>{professionalError}</div>;
  if (!admin || !professionalName) return <div>Cargando información…</div>;

  const edadCalculada = calcularEdad(admin.fecha_nacimiento);

  return (
    <DashboardAtencionKine
      rut={admin.rut}
      nombre={`${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}`}
      edad={edadCalculada}
      prevision={admin.prevision}
      date={state.date}
      time={state.time}
      professional={professionalName}
      atencion={atencion}
      examenFisico={examenFisico}
      diagnostico={diagnostico}
      planTratamiento={planTratamiento}
      onChangeAtencion={setAtencion}
      onChangeExamenFisico={setExamenFisico}
      onChangeDiagnostico={setDiagnostico}
      onChangePlanTratamiento={setPlanTratamiento}
      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}
      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering}
      ordering={ordering}
      onImprimir={handleImprimir}
      onGuardar={handleGuardar}
      onModificar={handleModificar}
      onCancelar={handleBackNavigation}
    />
  );
}
