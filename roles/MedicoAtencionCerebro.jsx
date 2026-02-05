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
  const [atencion, setAtencion] = useState("");

  // =========================
  // WEB SPEECH (CEREBRO)
  // =========================
  const speech = useWebSpeech({ lang: "es-CL" });

  async function handleDictado() {
    if (!speech.recording) {
      speech.start();
      return;
    }

    const texto = await speech.stop();
    if (texto) {
      setAtencion((prev) =>
        prev ? prev + "\n" + texto : texto
      );
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

      // 🔽 estado
      atencion={atencion}
      setAtencion={setAtencion}

      // 🔽 dictado
      onDictado={handleDictado}
      dictando={speech.recording}
      dictadoDisponible={speech.supported}
      dictadoLoading={speech.loading}
    />
  );
}
