import { useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicoAtencionCerebro() {
  const { state } = useLocation();

  // =========================
  // VALIDACIÓN DURA DE ENTRADA
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
  // FICHA ADMINISTRATIVA
  // =========================
  const [admin, setAdmin] = useState(null);
  const [adminError, setAdminError] = useState(null);

  useEffect(() => {
    async function loadFichaAdministrativa() {
      try {
        const res = await fetch(
          `${API_URL}/api/fichas/admin/${state.rut}`,
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        if (!res.ok) {
          throw new Error("ADMIN_NOT_FOUND");
        }

        const data = await res.json();
        setAdmin(data);
      } catch (e) {
        setAdminError("No se pudo cargar ficha administrativa");
      }
    }

    loadFichaAdministrativa();
  }, [state.rut]);

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
  // WEB SPEECH (REAL)
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

    // volcamos también a atención visible
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
      // quedan disponibles para botones posteriores

    } catch (e) {
      setOrderError("No se pudo ordenar clínicamente");
    } finally {
      setOrdering(false);
    }
  }

  // =========================
  // BLOQUEOS ADMINISTRATIVOS
  // =========================
  if (adminError) {
    return <div>Error cargando ficha administrativa</div>;
  }

  if (!admin) {
    return <div>Cargando ficha administrativa…</div>;
  }

  // =========================
  // ENTREGA DE MANDO A UI
  // =========================
  return (
    <DashboardAtencion
      /* ===============================
         FICHA ADMINISTRATIVA
      =============================== */
      rut={admin.rut}
      nombre={`${admin.nombre} ${admin.apellido_paterno}`}
      edad={admin.edad}
      sexo={admin.sexo}

      date={state.date}
      time={state.time}
      professional={state.professional}

      /* ===============================
         CONTENIDO CLÍNICO
      =============================== */
      atencion={atencion}
      receta={receta}
      examenes={examenes}

      onChangeAtencion={setAtencion}
      onChangeReceta={setReceta}
      onChangeExamenes={setExamenes}

      /* ===============================
         ACCIONES
      =============================== */
      onDictado={handleDictado}
      dictando={speech.recording}
      puedeDictar={speech.supported && !speech.loading}

      onOrdenarClinicamente={handleOrdenarClinicamente}
      puedeOrdenar={!ordering && rawText.trim().length > 0}

      /* opcional para UI futura */
      ordering={ordering}
      orderError={orderError}
    />
  );
}
