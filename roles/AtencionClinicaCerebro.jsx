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
  // FICHA ADMINISTRATIVA
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
        console.error("ERROR ADMIN:", e);
        setAdminError("No se pudo cargar ficha administrativa");
      }
    }

    loadFichaAdministrativa();
  }, [state?.rut, session?.usuario]);

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
  // WEB SPEECH
  // =========================
  const speech = useWebSpeech({ lang: "es-CL" });

  async function handleDictado() {
    if (!speech.recording) {
      speech.start();
      return;
    }

    const texto = await speech.stop();
    if (!texto) return;

    setRawText(prev => (prev ? prev + "\n" + texto : texto));
    setAtencion(prev => (prev ? prev + "\n" + texto : texto));
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
      console.error("ERROR GPT:", e);
      setOrderError("No se pudo ordenar clínicamente");
    } finally {
      setOrdering(false);
    }
  }

  // =========================
  // BLOQUEOS
  // =========================
  if (adminError) return <div>{adminError}</div>;
  if (!admin) return <div>Cargando ficha administrativa…</div>;

  // =========================
  // UI
  // =========================
  return (
    <DashboardAtencion
      /* ===== ADMINISTRATIVO ===== */
      rut={admin.rut}
      nombre={`${admin.nombre} ${admin.apellido_paterno} ${admin.apellido_materno || ""}`}
      edad={admin.edad}
      sexo={admin.sexo}
      direccion={admin.direccion || ""}
      telefono={admin.telefono || ""}
      email={admin.email || ""}
      prevision={admin.prevision || ""}

      date={state.date}
      time={state.time}
      professional={admin.profesional_nombre || state.professional}

      /* ===== CLÍNICO ===== */
      atencion={atencion}
      diagnostico={diagnostico}
      receta={receta}
      examenes={examenes}

      onChangeAtencion={setAtencion}
      onChangeDiagnostico={setDiagnostico}
      onChangeReceta={setReceta}
      onChangeExamenes={setExamenes}

      /* ===== ACCIONES ===== */
      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}

      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering}
    />
  );
}
