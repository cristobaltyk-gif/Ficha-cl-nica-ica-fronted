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

 // =========================
// ORIGEN DE NAVEGACIÓN
// =========================

const origin = state?.origin || "agenda";
function handleBackNavigation() {
  if (origin === "informes") {
    navigate("/medico/informes", { replace: true });
  } else {
    navigate("/medico/agenda/dia", { replace: true });
  }
} 

  // =========================
  // VALIDACIÓN DE CONTEXTO
  // =========================
  if (
    !state ||
    !state.rut ||
    !state.date ||
    !state.time ||
    !state.professional
  ) {
    return (
      <div className="dashboard-placeholder">
        Atención inválida o acceso directo no permitido
      </div>
    );
  }
// =========================
// VALIDAR SI ES HOY
// =========================
const hoy = new Date();
const hoyISO = hoy.toISOString().slice(0, 10); // YYYY-MM-DD

const esHoy = state.date === hoyISO;
  // =========================
  // FICHA ADMINISTRATIVA (PACIENTE)
  // =========================
  const [admin, setAdmin] = useState(null);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    if (!state?.rut) return;

    async function loadFichaAdministrativa() {
      try {
        setAdminError(null);

        const internalUser = session?.usuario;
        if (!internalUser) {
          setAdminError("Sesión inválida");
          return;
        }

        const res = await fetch(
          `${API_URL}/api/fichas/admin/${state.rut}`,
          {
            headers: {
              "Content-Type": "application/json",
              "X-Internal-User": internalUser
            }
          }
        );

        if (!res.ok) throw new Error("ADMIN_ERROR");

        const data = await res.json();
        setAdmin(data);
      } catch (e) {
        console.error("❌ ERROR ADMIN:", e);
        setAdminError("No se pudo cargar ficha administrativa");
      }
    }

    loadFichaAdministrativa();
  }, [state?.rut, session?.usuario]);

  // =========================
  // PROFESIONAL (BACKEND = VERDAD)
  // =========================
  const [professionalName, setProfessionalName] = useState("");
  const [professionalError, setProfessionalError] = useState(null);

  useEffect(() => {
    async function loadProfessional() {
      try {
        setProfessionalError(null);

        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error("PROFESSIONALS_ERROR");

        const data = await res.json();
        const prof = data.find(p => p.id === state.professional);

        if (!prof) {
          setProfessionalError("Profesional no autorizado");
          return;
        }

        setProfessionalName(prof.name);
      } catch (e) {
        console.error("❌ ERROR PROFESSIONAL:", e);
        setProfessionalError("No se pudo cargar profesional");
      }
    }

    loadProfessional();
  }, [state.professional]);

  // =========================
  // ESTADO CLÍNICO
  // =========================
  const [rawText, setRawText] = useState("");
  const [atencion, setAtencion] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [receta, setReceta] = useState("");
  const [examenes, setExamenes] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [ordenKinesiologia, setOrdenKinesiologia] = useState("");
  const [indicacionQuirurgica, setIndicacionQuirurgica] = useState("");

  // =========================
// CALCULAR EDAD DESDE FECHA NACIMIENTO
// =========================
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return "";

  const nacimiento = new Date(fechaNacimiento);
  const hoy = new Date();

  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();

  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
}
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // =========================
  // WEB SPEECH — AUTO CICLO POR CHUNKS
  // =========================
  const speech = useWebSpeech({
    lang: "es-CL",
    onChunk: (text) => {
      // 🔒 Cada chunk confirmado se guarda inmediatamente
      setRawText(prev => (prev ? prev + "\n" + text : text));
      setAtencion(prev => (prev ? prev + "\n" + text : text));
    }
  });

  // ▶️ / ⏹️ Control TOTAL por el médico
  function handleDictado() {
    if (!speech.recording) {
      speech.start();   // inicia auto-ciclo
    } else {
      speech.stop();    // detiene todo (flush final incluido)
    }
  }

  // =========================
  // ORDENAR CLÍNICAMENTE (GPT)
  // =========================
  async function handleOrdenarClinicamente() {
    const inputText = atencion.trim() || rawText.trim();

    if (!inputText) {
      setOrderError("No hay texto para ordenar");
      return;
    }

    setOrdering(true);
    setOrderError(null);

    try {
      const res = await fetch(
        `${API_URL}/api/gpt/clinical-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText })
        }
      );

      if (!res.ok) throw new Error("GPT_ERROR");

      const data = await res.json();

      setAtencion(data.atencion || "");
      setDiagnostico(data.diagnostico || "");
      setReceta(data.receta || "");
      setExamenes(data.examenes || "");

    } catch (e) {
      console.error("❌ ERROR GPT:", e);
      setOrderError("No se pudo ordenar clínicamente");
    } finally {
      setOrdering(false);
    }
  }
// =========================
// PDF HELPERS
// =========================

async function openPdf(endpoint, payload) {
  try {
    const res = await fetch(`${API_URL}/api/pdf/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-User": session?.usuario
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("PDF_ERROR");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank"); // abre en nueva pestaña
  } catch (e) {
    console.error("❌ ERROR PDF:", e);
  }
      }

  // =========================
// IMPRESIONES INDIVIDUALES
// =========================

function handlePrintReceta() {
  openPdf("receta", {
    nombre: admin.nombre,
    apellido_paterno: admin.apellido_paterno,
    apellido_materno: admin.apellido_materno,
    fecha_nacimiento: admin.fecha_nacimiento,
    edad: edadCalculada,
    rut: admin.rut,
    diagnostico,
    medicamentos: [],
    indicaciones: receta
  });
}

function handlePrintInforme() {
  openPdf("informe", {
    nombre: admin.nombre,
    apellido_paterno: admin.apellido_paterno,
    apellido_materno: admin.apellido_materno,
    fecha_nacimiento: admin.fecha_nacimiento,
    edad: edadCalculada,
    rut: admin.rut,

    diagnostico: diagnostico,
    indicaciones: indicaciones,
    professional: state.professional
  });
}

function handlePrintKine() {
  openPdf("kinesiologia", {
    nombre: admin.nombre,
    apellido_paterno: admin.apellido_paterno,
    apellido_materno: admin.apellido_materno,
    fecha_nacimiento: admin.fecha_nacimiento,
    edad: edadCalculada,
    rut: admin.rut,
    diagnostico,
    lado: "",
    indicaciones: ordenKinesiologia
  });
}

  function handlePrintExamenes() {
  openPdf("examenes", {
    nombre: admin.nombre,
    apellido_paterno: admin.apellido_paterno,
    apellido_materno: admin.apellido_materno,
    fecha_nacimiento: admin.fecha_nacimiento,
    edad: edadCalculada,
    rut: admin.rut,
    diagnostico,
    examenes
  });
  }
  
function handlePrintQuirurgica() {
  openPdf("quirurgica", {
    nombre: admin.nombre,
    apellido_paterno: admin.apellido_paterno,
    apellido_materno: admin.apellido_materno,
    fecha_nacimiento: admin.fecha_nacimiento,
    edad: edadCalculada,
    rut: admin.rut,

    diagnostico: diagnostico,
    indicaciones: indicacionQuirurgica,
    professional: state.professional
  });
}

  // =========================
// GUARDAR TODO
// =========================

async function handleGuardarTodo() {

  if (!esHoy) {
    alert("Solo se puede guardar atención del día actual");
    return;
  }

  try {
    // ========================================
    // 1️⃣ GUARDAR EVENTO JSON EN BACKEND
    // ========================================
    const res = await fetch(`${API_URL}/api/fichas/evento`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-User": session?.usuario
      },
      body: JSON.stringify({
        rut: admin.rut,
        fecha: state.date,
        hora: state.time,
        atencion,
        diagnostico,
        receta,
        examenes,
        indicaciones,
        orden_kinesiologia: ordenKinesiologia,
        indicacion_quirurgica: indicacionQuirurgica
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al guardar evento clínico");
    }

    // ========================================
    // 2️⃣ IMPRIMIR PDFs (tu lógica original)
    // ========================================
    if (receta.trim()) {
      await handlePrintReceta();
    }

    if (atencion.trim()) {
      await handlePrintInforme();
    }

    if (diagnostico.trim()) {
      await handlePrintKine();
    }

    if (examenes.trim()) {
      await handlePrintExamenes(); 
    }

    alert("✅ Evento clínico guardado correctamente");
    handleBackNavigation();

  } catch (e) {
    console.error("❌ ERROR GUARDAR EVENTO:", e);
    alert(e.message);
  }
}
// ========================================
// MODIFICAR EVENTO CLÍNICO
// ========================================
async function handleModificarEvento() {

  if (!esHoy) {
    alert("Solo se puede modificar atención del día actual");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/fichas/evento`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-User": session?.usuario
      },
      body: JSON.stringify({
        rut: admin.rut,
        fecha: state.date,
        hora: state.time,
        atencion,
        diagnostico,
        receta,
        examenes,
        indicaciones,
        orden_kinesiologia: ordenKinesiologia,
        indicacion_quirurgica: indicacionQuirurgica
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error al modificar evento");
    }

    alert("✅ Evento clínico modificado correctamente");
    handleBackNavigation(); 

  } catch (e) {
    console.error("❌ ERROR MODIFICAR:", e);
    alert(e.message);
  }
}  
  // =========================
  // BLOQUEOS
  // =========================
  if (adminError) return <div>{adminError}</div>;
  if (professionalError) return <div>{professionalError}</div>;
  if (!admin || !professionalName)
    return <div>Cargando información…</div>;
  // Edad calculada real desde fecha_nacimiento
const edadCalculada = calcularEdad(admin.fecha_nacimiento);

  // =========================
  // UI — DASHBOARD SOLO PINTA
  // =========================
  return (
    <DashboardAtencion
      /* =========================
         FICHA ADMINISTRATIVA
      ========================= */
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

      /* ✅ PROFESIONAL CORRECTO */
      professional={professionalName}

      /* =========================
         CONTENIDO CLÍNICO
      ========================= */
      atencion={atencion}
      diagnostico={diagnostico}
      receta={receta}
      examenes={examenes}
      indicaciones={indicaciones}
      ordenKinesiologia={ordenKinesiologia
      indicacionQuirurgica={indicacionQuirurgica
        
      onChangeAtencion={setAtencion}
      onChangeDiagnostico={setDiagnostico}
      onChangeReceta={setReceta}
      onChangeExamenes={setExamenes}
      onChangeIndicaciones={setIndicaciones}
      onChangeOrdenKinesiologia={setOrdenKinesiologia}
      onChangeIndicacionQuirurgica={setIndicacionQuirurgica}
  
      /* =========================
         ACCIONES
      ========================= */
      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}

      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering}
      ordering={ordering}
      orderError={orderError}
      onImprimir={(tipo) => {
   
      
      if (tipo === "receta") handlePrintReceta();
      if (tipo === "examenes") handlePrintExamenes();   // ✅ ahora correcto
      if (tipo === "indicaciones") handlePrintInforme();
      if (tipo === "kinesiologia") handlePrintKine();
      if (tipo === "quirurgica") handlePrintQuirurgica();
      }}

      onGuardar={handleGuardarTodo}
      onModificar={handleModificarEvento}
      onCancelar={handleBackNavigation}
      
    

    />
  );
}
