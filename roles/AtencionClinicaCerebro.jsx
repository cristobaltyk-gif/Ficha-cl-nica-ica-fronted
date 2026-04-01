import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../auth/AuthContext.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicoAtencionCerebro() {
  const { state } = useLocation();
  const { session } = useAuth();
  const navigate = useNavigate();
  const origin = state?.origin;

  function handleBackNavigation() {
    if (origin === "pacientes") {
      navigate("/medico/pacientes", { replace: true, state: { rut: state.rut } });
      return;
    }
    if (origin === "informes") {
      navigate("/medico/informes", { replace: true, state: { rut: state.rut } });
      return;
    }
    if (origin === "agenda") {
      navigate(-1);
      return;
    }
    navigate("/medico", { replace: true });
  }

  if (!state || !state.rut || !state.date || !state.time || !state.professional) {
    return <div className="dashboard-placeholder">Atención inválida o acceso directo no permitido</div>;
  }

  const hoy    = new Date();
  const hoyISO = hoy.toISOString().slice(0, 10);
  const esHoy  = state.date === hoyISO;

  const [admin,             setAdmin]             = useState(null);
  const [adminError,        setAdminError]        = useState(null);

  useEffect(() => {
    if (!state?.rut) return;
    async function loadFichaAdministrativa() {
      try {
        setAdminError(null);
        const internalUser = session?.usuario;
        if (!internalUser) { setAdminError("Sesión inválida"); return; }
        const res = await fetch(
          `${API_URL}/api/fichas/admin/${state.rut}`,
          { headers: { "Content-Type": "application/json", "X-Internal-User": internalUser } }
        );
        if (!res.ok) throw new Error("ADMIN_ERROR");
        const data = await res.json();
        setAdmin(data);
      } catch (e) {
        setAdminError("No se pudo cargar ficha administrativa");
      }
    }
    loadFichaAdministrativa();
  }, [state?.rut, session?.usuario]);

  const [professionalName,  setProfessionalName]  = useState("");
  const [professionalError, setProfessionalError] = useState(null);

  useEffect(() => {
    async function loadProfessional() {
      try {
        setProfessionalError(null);
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("PROFESSIONALS_ERROR");
        const data = await res.json();
        const prof = data.find(p => p.id === state.professional);
        if (!prof) { setProfessionalError("Profesional no autorizado"); return; }
        setProfessionalName(prof.name);
      } catch (e) {
        setProfessionalError("No se pudo cargar profesional");
      }
    }
    loadProfessional();
  }, [state.professional]);

  const [rawText,              setRawText]              = useState("");
  const [atencion,             setAtencion]             = useState("");
  const [diagnostico,          setDiagnostico]          = useState("");
  const [receta,               setReceta]               = useState("");
  const [examenes,             setExamenes]             = useState("");
  const [indicaciones,         setIndicaciones]         = useState("");
  const [ordenKinesiologia,    setOrdenKinesiologia]    = useState("");
  const [indicacionQuirurgica, setIndicacionQuirurgica] = useState("");

  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  const [ordering,   setOrdering]   = useState(false);
  const [orderError, setOrderError] = useState(null);

  const speech = useWebSpeech({
    lang: "es-CL",
    onChunk: (text) => {
      setRawText(prev => (prev ? prev + "\n" + text : text));
      setAtencion(prev => (prev ? prev + "\n" + text : text));
    }
  });

  function handleDictado() {
    if (!speech.recording) speech.start();
    else speech.stop();
  }

  async function handleOrdenarClinicamente() {
    const inputText = atencion.trim() || rawText.trim();
    if (!inputText) { setOrderError("No hay texto para ordenar"); return; }
    setOrdering(true);
    setOrderError(null);
    try {
      const res = await fetch(`${API_URL}/api/claude/clinical-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      if (!res.ok) throw new Error("CLAUDE_ERROR");
      const data = await res.json();
      setAtencion(data.atencion                       || "");
      setDiagnostico(data.diagnostico                 || "");
      setReceta(data.receta                           || "");
      setExamenes(data.examenes                       || "");
      setIndicaciones(data.indicaciones               || "");
      setOrdenKinesiologia(data.ordenKinesica         || "");
      setIndicacionQuirurgica(data.indicacionQuirurgica || "");
    } catch (e) {
      setOrderError("No se pudo ordenar clínicamente");
    } finally {
      setOrdering(false);
    }
  }

  async function openPdf(endpoint, payload) {
    try {
      const res = await fetch(`${API_URL}/api/pdf/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("PDF_ERROR");
      const blob = await res.blob();
      window.open(window.URL.createObjectURL(blob), "_blank");
    } catch (e) {
      console.error("❌ ERROR PDF:", e);
    }
  }

  function buildPacienteBase() {
    return {
      nombre:           admin.nombre,
      apellido_paterno: admin.apellido_paterno,
      apellido_materno: admin.apellido_materno,
      fecha_nacimiento: admin.fecha_nacimiento,
      edad:             edadCalculada,
      rut:              admin.rut,
    };
  }

  function handlePrintReceta() {
    openPdf("receta", { ...buildPacienteBase(), diagnostico, medicamentos: [], indicaciones: receta });
  }
  function handlePrintInforme() {
    openPdf("informe", { ...buildPacienteBase(), diagnostico, indicaciones, professional: state.professional });
  }
  function handlePrintKine() {
    openPdf("kinesiologia", { ...buildPacienteBase(), diagnostico, lado: "", indicaciones: ordenKinesiologia });
  }
  function handlePrintExamenes() {
    openPdf("examenes", { ...buildPacienteBase(), diagnostico, examenes });
  }
  function handlePrintQuirurgica() {
    openPdf("quirurgica", { ...buildPacienteBase(), diagnostico, indicaciones: indicacionQuirurgica, professional: state.professional });
  }

  async function handleGuardarTodo() {
    if (!esHoy) { alert("Solo se puede guardar atención del día actual"); return; }

    try {
      // 1. Guardar evento clínico
      const res = await fetch(`${API_URL}/api/fichas/evento`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({
          rut: admin.rut, fecha: state.date, hora: state.time,
          atencion, diagnostico, receta, examenes, indicaciones,
          orden_kinesiologia: ordenKinesiologia,
          indicacion_quirurgica: indicacionQuirurgica
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al guardar"); }

      // 2. Abrir PDFs
      if (receta.trim())    await handlePrintReceta();
      if (atencion.trim())  await handlePrintInforme();
      if (diagnostico.trim()) await handlePrintKine();
      if (examenes.trim())  await handlePrintExamenes();

      // 3. Enviar email con documentos si el paciente tiene email
      const emailPaciente = admin.email?.trim();
      if (emailPaciente) {
        const base = buildPacienteBase();
        const emailBody = {
          email:              emailPaciente,
          nombre_paciente:    `${admin.nombre} ${admin.apellido_paterno}`.trim(),
          fecha:              state.date,
          profesional_nombre: professionalName,
          receta:      receta.trim()      ? { ...base, diagnostico, medicamentos: [], indicaciones: receta } : null,
          informe:     atencion.trim()    ? { ...base, diagnostico, indicaciones, professional: state.professional } : null,
          kinesiologia: ordenKinesiologia.trim() ? { ...base, diagnostico, lado: "", indicaciones: ordenKinesiologia } : null,
          examenes:    examenes.trim()    ? { ...base, diagnostico, examenes } : null,
          quirurgica:  indicacionQuirurgica.trim() ? { ...base, diagnostico, indicaciones: indicacionQuirurgica, professional: state.professional } : null,
        };

        try {
          await fetch(`${API_URL}/api/pdf/enviar-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
            body: JSON.stringify(emailBody)
          });
        } catch {
          // No bloqueamos si falla el email
        }
      }

      alert("✅ Evento clínico guardado correctamente");
      handleBackNavigation();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleModificarEvento() {
    if (!esHoy) { alert("Solo se puede modificar atención del día actual"); return; }
    try {
      const res = await fetch(`${API_URL}/api/fichas/evento`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
        body: JSON.stringify({
          rut: admin.rut, fecha: state.date, hora: state.time,
          atencion, diagnostico, receta, examenes, indicaciones,
          orden_kinesiologia: ordenKinesiologia,
          indicacion_quirurgica: indicacionQuirurgica
        })
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Error al modificar"); }
      alert("✅ Evento clínico modificado correctamente");
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
    <DashboardAtencion
      rut={admin.rut}
      nombre={`${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}`}
      edad={edadCalculada}
      sexo={admin.sexo}
      direccion={admin.direccion}
      telefono={admin.telefono}
      email={admin.email}
      prevision={admin.prevision}
      date={state.date}
      time={state.time}
      professional={professionalName}
      atencion={atencion}
      diagnostico={diagnostico}
      receta={receta}
      examenes={examenes}
      indicaciones={indicaciones}
      ordenKinesiologia={ordenKinesiologia}
      indicacionQuirurgica={indicacionQuirurgica}
      onChangeAtencion={setAtencion}
      onChangeDiagnostico={setDiagnostico}
      onChangeReceta={setReceta}
      onChangeExamenes={setExamenes}
      onChangeIndicaciones={setIndicaciones}
      onChangeOrdenKinesiologia={setOrdenKinesiologia}
      onChangeIndicacionQuirurgica={setIndicacionQuirurgica}
      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}
      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering}
      ordering={ordering}
      orderError={orderError}
      onImprimir={(tipo) => {
        if (tipo === "receta")       handlePrintReceta();
        if (tipo === "examenes")     handlePrintExamenes();
        if (tipo === "indicaciones") handlePrintInforme();
        if (tipo === "kinesiologia") handlePrintKine();
        if (tipo === "quirurgica")   handlePrintQuirurgica();
      }}
      onGuardar={handleGuardarTodo}
      onModificar={handleModificarEvento}
      onCancelar={handleBackNavigation}
    />
  );
        }
