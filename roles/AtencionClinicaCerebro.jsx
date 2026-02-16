import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../auth/AuthContext.jsx";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicoAtencionCerebro() {
  const { state } = useLocation();
  const { session } = useAuth();

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
    edad: admin.edad,
    rut: admin.rut,
    diagnostico,
    medicamentos: [], // luego podemos estructurar receta
    indicaciones: receta
  });
}

function handlePrintInforme() {
  openPdf("informe", {
    nombre: admin.nombre,
    edad: admin.edad,
    rut: admin.rut,
    motivoConsulta: atencion,
    impresionDiagnostica: diagnostico,
    estudios: examenes,
    plan: receta
  });
}

function handlePrintKine() {
  openPdf("kinesiologia", {
    nombre: admin.nombre,
    edad: admin.edad,
    rut: admin.rut,
    diagnostico,
    lado: "",
    indicaciones: receta
  });
}

function handlePrintQuirurgica() {
  openPdf("quirurgica", {
    nombre: admin.nombre,
    edad: admin.edad,
    rut: admin.rut,
    diagnostico,
    codigoCirugia: "",
    tipoCirugia: "",
    modalidad: "",
    equipoMedico: "",
    insumos: ""
  });
}

  // =========================
// GUARDAR TODO
// =========================

async function handleGuardarTodo() {

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
    await handlePrintQuirurgica();
  }
}
  // =========================
  // BLOQUEOS
  // =========================
  if (adminError) return <div>{adminError}</div>;
  if (professionalError) return <div>{professionalError}</div>;
  if (!admin || !professionalName)
    return <div>Cargando información…</div>;

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
      edad={admin.edad}
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

      onChangeAtencion={setAtencion}
      onChangeDiagnostico={setDiagnostico}
      onChangeReceta={setReceta}
      onChangeExamenes={setExamenes}

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
        if (tipo === "examenes") handlePrintQuirurgica();
        if (tipo === "indicaciones") handlePrintInforme();
        if (tipo === "kinesiologia") handlePrintKine();
        if (tipo === "quirurgica") handlePrintQuirurgica();
      }}

      onGuardar={handleGuardarTodo}
    />
  );
}
