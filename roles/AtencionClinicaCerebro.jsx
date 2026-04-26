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
    if (origin === "pacientes") { navigate("/medico/pacientes", { replace: true, state: { rut: state.rut } }); return; }
    if (origin === "informes")  { navigate("/medico/informes",  { replace: true, state: { rut: state.rut } }); return; }
    if (origin === "agenda")    { navigate(-1); return; }
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
  const [professionalName,  setProfessionalName]  = useState("");
  const [professionalError, setProfessionalError] = useState(null);

  // HISTORIAL
  const [showHistorial,   setShowHistorial]   = useState(false);
  const [historialData,   setHistorialData]   = useState([]);
  const [historialLoading,setHistorialLoading]= useState(false);

  useEffect(() => {
    if (!state?.rut) return;
    async function loadFichaAdministrativa() {
      try {
        setAdminError(null);
        const internalUser = session?.usuario;
        if (!internalUser) { setAdminError("Sesión inválida"); return; }
        const res = await fetch(`${API_URL}/api/fichas/admin/${state.rut}`,
          { headers: { "Content-Type": "application/json", "X-Internal-User": internalUser } });
        if (!res.ok) throw new Error("ADMIN_ERROR");
        setAdmin(await res.json());
      } catch { setAdminError("No se pudo cargar ficha administrativa"); }
    }
    loadFichaAdministrativa();
  }, [state?.rut, session?.usuario]);

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
      } catch { setProfessionalError("No se pudo cargar profesional"); }
    }
    loadProfessional();
  }, [state.professional]);

  async function handleAbrirHistorial() {
    setShowHistorial(true);
    if (historialData.length > 0) return;
    setHistorialLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/fichas/evento/${state.rut}`,
        { headers: { "X-Internal-User": session?.usuario } });
      if (!res.ok) throw new Error();
      setHistorialData(await res.json());
    } catch { setHistorialData([]); }
    finally { setHistorialLoading(false); }
  }

  const [rawText,              setRawText]              = useState("");
  const [atencion,             setAtencion]             = useState("");
  const [diagnostico,          setDiagnostico]          = useState("");
  const [receta,               setReceta]               = useState("");
  const [examenes,             setExamenes]             = useState("");
  const [indicaciones,         setIndicaciones]         = useState("");
  const [ordenKinesiologia,    setOrdenKinesiologia]    = useState("");
  const [indicacionQuirurgica, setIndicacionQuirurgica] = useState("");
  const [ordering,             setOrdering]             = useState(false);
  const [orderError,           setOrderError]           = useState(null);

  function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "";
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  const speech = useWebSpeech({
    lang: "es-CL",
    onChunk: (text) => {
      setRawText(prev => (prev ? prev + "\n" + text : text));
      setAtencion(prev => (prev ? prev + "\n" + text : text));
    }
  });

  function handleDictado() {
    if (!speech.recording) speech.start(); else speech.stop();
  }

  async function handleOrdenarClinicamente() {
    const inputText = atencion.trim() || rawText.trim();
    if (!inputText) { setOrderError("No hay texto para ordenar"); return; }
    setOrdering(true); setOrderError(null);
    try {
      const res = await fetch(`${API_URL}/api/claude/clinical-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });
      if (!res.ok) throw new Error("CLAUDE_ERROR");
      const data = await res.json();
      setAtencion(data.atencion || "");
      setDiagnostico(data.diagnostico || "");
      setReceta(data.receta || "");
      setExamenes(data.examenes || "");
      setIndicaciones(data.indicaciones || "");
      setOrdenKinesiologia(data.ordenKinesica || "");
      setIndicacionQuirurgica(data.indicacionQuirurgica || "");
    } catch { setOrderError("No se pudo ordenar clínicamente"); }
    finally { setOrdering(false); }
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
    } catch (e) { console.error("❌ ERROR PDF:", e); }
  }

  function buildPacienteBase() {
    return {
      nombre: admin.nombre, apellido_paterno: admin.apellido_paterno,
      apellido_materno: admin.apellido_materno, fecha_nacimiento: admin.fecha_nacimiento,
      edad: edadCalculada, rut: admin.rut,
    };
  }

  function handlePrintReceta()    { openPdf("receta",      { ...buildPacienteBase(), diagnostico, medicamentos: [], indicaciones: receta }); }
  function handlePrintInforme()   { openPdf("informe",     { ...buildPacienteBase(), diagnostico, indicaciones, professional: state.professional }); }
  function handlePrintKine()      { openPdf("kinesiologia",{ ...buildPacienteBase(), diagnostico, lado: "", indicaciones: ordenKinesiologia }); }
  function handlePrintExamenes()  { openPdf("examenes",    { ...buildPacienteBase(), diagnostico, examenes }); }
  function handlePrintQuirurgica(){ openPdf("quirurgica",  { ...buildPacienteBase(), diagnostico, indicaciones: indicacionQuirurgica, professional: state.professional }); }

  async function handleGuardarTodo() {
    if (!esHoy) { alert("Solo se puede guardar atención del día actual"); return; }
    try {
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
      if (receta.trim())    await handlePrintReceta();
      if (atencion.trim())  await handlePrintInforme();
      if (diagnostico.trim()) await handlePrintKine();
      if (examenes.trim())  await handlePrintExamenes();
      const emailPaciente = admin.email?.trim();
      if (emailPaciente) {
        const base = buildPacienteBase();
        try {
          await fetch(`${API_URL}/api/pdf/enviar-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Internal-User": session?.usuario },
            body: JSON.stringify({
              email: emailPaciente,
              nombre_paciente: `${admin.nombre} ${admin.apellido_paterno}`.trim(),
              fecha: state.date, profesional_nombre: professionalName,
              receta:      receta.trim()      ? { ...base, diagnostico, medicamentos: [], indicaciones: receta } : null,
              informe:     atencion.trim()    ? { ...base, diagnostico, indicaciones, professional: state.professional } : null,
              kinesiologia: ordenKinesiologia.trim() ? { ...base, diagnostico, lado: "", indicaciones: ordenKinesiologia } : null,
              examenes:    examenes.trim()    ? { ...base, diagnostico, examenes } : null,
              quirurgica:  indicacionQuirurgica.trim() ? { ...base, diagnostico, indicaciones: indicacionQuirurgica, professional: state.professional } : null,
            })
          });
        } catch {}
      }
      alert("✅ Evento clínico guardado correctamente");
      handleBackNavigation();
    } catch (e) { alert(e.message); }
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
    } catch (e) { alert(e.message); }
  }

  if (adminError)        return <div>{adminError}</div>;
  if (professionalError) return <div>{professionalError}</div>;
  if (!admin || !professionalName) return <div>Cargando información…</div>;

  const edadCalculada = calcularEdad(admin.fecha_nacimiento);

  return (
    <>
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
        onAbrirHistorial={handleAbrirHistorial}
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

      {/* DRAWER HISTORIAL */}
      {showHistorial && (
        <HistorialDrawer
          eventos={historialData}
          loading={historialLoading}
          onClose={() => setShowHistorial(false)}
        />
      )}
    </>
  );
}

function HistorialDrawer({ eventos, loading, onClose }) {
  const [detalle, setDetalle] = useState(null);
  const [idx,     setIdx]     = useState(null);

  function abrirDetalle(ev, i) { setDetalle(ev); setIdx(i); }
  function anterior() { if (idx > 0) { setDetalle(eventos[idx-1]); setIdx(idx-1); } }
  function siguiente() { if (idx < eventos.length-1) { setDetalle(eventos[idx+1]); setIdx(idx+1); } }

  const CAMPOS = [
    { key: "atencion",              label: "Motivo de consulta" },
    { key: "diagnostico",           label: "Diagnóstico" },
    { key: "receta",                label: "Receta" },
    { key: "examenes",              label: "Exámenes" },
    { key: "indicaciones",          label: "Indicaciones" },
    { key: "orden_kinesiologia",    label: "Orden kinésica" },
    { key: "indicacion_quirurgica", label: "Indicación quirúrgica" },
  ];

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{
        position:"fixed", inset:0, background:"rgba(15,23,42,0.45)",
        zIndex:1000, backdropFilter:"blur(2px)"
      }}/>

      {/* Panel */}
      <div style={{
        position:"fixed", top:0, right:0, bottom:0, width:"min(480px,100vw)",
        background:"#fff", zIndex:1001, display:"flex", flexDirection:"column",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.15)", fontFamily:"'DM Sans',system-ui,sans-serif"
      }}>

        {/* Header drawer */}
        <div style={{
          padding:"20px 20px 16px", borderBottom:"1px solid #e2e8f0",
          display:"flex", alignItems:"center", justifyContent:"space-between"
        }}>
          {detalle ? (
            <button onClick={() => setDetalle(null)} style={{
              display:"flex", alignItems:"center", gap:6, background:"none",
              border:"none", cursor:"pointer", color:"#475569", fontSize:13, fontWeight:600, padding:0
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Historial
            </button>
          ) : (
            <div>
              <p style={{margin:0, fontSize:16, fontWeight:700, color:"#0f172a"}}>Historial clínico</p>
              <p style={{margin:0, fontSize:12, color:"#94a3b8"}}>{eventos.length} atenciones</p>
            </div>
          )}
          <button onClick={onClose} style={{
            background:"none", border:"none", cursor:"pointer", color:"#94a3b8", padding:4
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 0 24px" }}>

          {loading && (
            <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
              Cargando historial…
            </div>
          )}

          {/* LISTA */}
          {!loading && !detalle && (
            <>
              {eventos.length === 0 && (
                <div style={{ padding:40, textAlign:"center", color:"#94a3b8", fontSize:13 }}>
                  Sin atenciones previas registradas
                </div>
              )}
              {eventos.map((ev, i) => (
                <div key={i} onClick={() => abrirDetalle(ev, i)} style={{
                  padding:"14px 20px", borderBottom:"1px solid #f1f5f9",
                  cursor:"pointer", display:"flex", alignItems:"center",
                  justifyContent:"space-between", gap:12,
                  transition:"background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{
                        fontSize:12, fontWeight:600, color:"#0f172a",
                        background:"#f1f5f9", borderRadius:4, padding:"2px 7px"
                      }}>
                        {ev.fecha}
                      </span>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>{ev.hora}</span>
                    </div>
                    <p style={{
                      margin:0, fontSize:13, fontWeight:600, color:"#0f172a",
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"
                    }}>
                      {ev.diagnostico || "Sin diagnóstico"}
                    </p>
                    {ev.professional_name && (
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"#94a3b8" }}>
                        {ev.professional_name}
                      </p>
                    )}
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))}
            </>
          )}

          {/* DETALLE */}
          {!loading && detalle && (
            <div>
              {/* Nav prev/next */}
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"12px 20px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc"
              }}>
                <button onClick={anterior} disabled={idx === 0} style={{
                  display:"flex", alignItems:"center", gap:4, background:"none", border:"none",
                  cursor: idx === 0 ? "not-allowed" : "pointer",
                  color: idx === 0 ? "#cbd5e1" : "#475569", fontSize:12, fontWeight:600, padding:0
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Anterior
                </button>
                <span style={{ fontSize:11, color:"#94a3b8" }}>
                  {idx + 1} / {eventos.length}
                </span>
                <button onClick={siguiente} disabled={idx === eventos.length - 1} style={{
                  display:"flex", alignItems:"center", gap:4, background:"none", border:"none",
                  cursor: idx === eventos.length - 1 ? "not-allowed" : "pointer",
                  color: idx === eventos.length - 1 ? "#cbd5e1" : "#475569", fontSize:12, fontWeight:600, padding:0
                }}>
                  Siguiente
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              {/* Info header */}
              <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #f1f5f9" }}>
                <div style={{ display:"flex", gap:8, marginBottom:6 }
