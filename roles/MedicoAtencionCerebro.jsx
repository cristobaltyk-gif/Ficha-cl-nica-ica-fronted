import { useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

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

    // texto crudo (para GPT después)
    setRawText((prev) =>
      prev ? prev + "\n" + texto : texto
    );

    // por ahora lo volcamos a atención
    setAtencion((prev) =>
      prev ? prev + "\n" + texto : texto
    );
  }

  // =========================
  // ORDENAR CLÍNICAMENTE (STUB)
  // =========================
  function handleOrdenarClinicamente() {
    // aquí irá GPT
    // usará rawText y seteará:
    // setAtencion
    // setReceta
    // setExamenes
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
      puedeOrdenar={rawText.trim().length > 0}
    />
  );
}
