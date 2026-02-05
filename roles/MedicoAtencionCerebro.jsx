import { useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicoAtencionCerebro() {
  const { state } = useLocation();

  // =========================
  // VALIDACIÓN DURA
  // =========================
  if (
    !state ||
    !state.rut ||
    !state.date ||
    !state.time ||
    !state.professional
  ) {
    return <Navigate to="/medico/agenda" replace />;
  }

  // =========================
  // ESTADO CLÍNICO (CEREBRO)
  // =========================
  const [rawText, setRawText] = useState("");     // texto crudo dictado
  const [atencion, setAtencion] = useState("");  // editable
  const [receta, setReceta] = useState("");
  const [examenes, setExamenes] = useState("");

  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // =========================
  // WEB SPEECH (CEREBRO)
  // =========================
  const speech = useWebSpeech({ lang: "es-CL" });

  async function handleDictado() {
    // ▶️ iniciar dictado
    if (!speech.recording) {
      speech.start();
      return;
    }

    // ⏹ detener dictado
    const texto = await speech.stop();
    if (!texto) return;

    // texto crudo (para GPT)
    setRawText((prev) =>
      prev ? prev + "\n" + texto : texto
    );

    // mientras tanto lo volcamos a atención
    setAtencion((prev) =>
      prev ? prev + "\n" + texto : texto
    );
  }

  // =========================
  // ORDENAR CLÍNICAMENTE (GPT REAL)
  // =========================
  async function handleOrdenarClinicamente() {
    if (!rawText.trim()) return;

    setOrdering(true);
    setOrderError(null);

    try {
      const res = await fetch(
        `${API_URL}/api/gpt/clinical-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: rawText
          })
        }
      );

      if (!res.ok) {
        throw new Error("GPT_ERROR");
      }

      const data = await res.json();

      setAtencion(data.atencion || "");
      setReceta(data.receta || "");
      setExamenes(data.examenes || "");

      // data.ordenKinesica
      // data.indicaciones
      // data.indicacionQuirurgica
      // quedan disponibles para botones después

    } catch (e) {
      setOrderError("No se pudo ordenar clínicamente");
    } finally {
      setOrdering(false);
    }
  }

  // =========================
  // ENTREGA DE MANDO A UI
  // =========================
  return (
    <DashboardAtencion
      rut={state.rut}
      date={state.date}
      time={state.time}
      professional={state.professional}

      atencion={atencion}
      receta={receta}
      examenes={examenes}

      onChangeAtencion={setAtencion}
      onChangeReceta={setReceta}
      onChangeExamenes={setExamenes}

      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}

      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering && rawText.trim().length > 0}

      // opcional si después quieres mostrar error/estado
      ordering={ordering}
      orderError={orderError}
    />
  );
}
