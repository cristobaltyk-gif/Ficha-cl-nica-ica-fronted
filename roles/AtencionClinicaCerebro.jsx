import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../auth/AuthContext.jsx"; // 👈 AGREGADO
import DashboardAtencion from "../pages/dashboard-atencion.jsx";
import { useWebSpeech } from "../modules/webspeech/useWebSpeech";

const API_URL = import.meta.env.VITE_API_URL;

export default function MedicoAtencionCerebro() {
  const { state } = useLocation();
  const { session } = useAuth(); // 👈 USUARIO INTERNO REAL (clave en USERS)

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

        const internalUser = session?.usuario; // 👈 CLAVE REAL EN USERS
        if (!internalUser) {
          setAdminError("Sesión inválida (sin usuario interno)");
          return;
        }

        const res = await fetch(
          `${API_URL}/api/fichas/admin/${state.rut}`,
          {
            headers: {
              "Content-Type": "application/json",
              // 🔐 AUTH INTERNO REAL
              "X-Internal-User": internalUser
            }
          }
        );

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("ADMIN FETCH FAIL", res.status, txt);
          throw new Error(`ADMIN_${res.status}`);
        }

        const data = await res.json();
        setAdmin(data);
      } catch (e) {
        console.error("ERROR FICHA ADMIN:", e);
        setAdminError("No se pudo cargar ficha administrativa");
      }
    }

    loadFichaAdministrativa();
  }, [state?.rut, session?.usuario]);

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
          body: JSON.stringify({ text: rawText })
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.error("GPT FAIL", res.status, txt);
        throw new Error("GPT_ERROR");
      }

      const data = await res.json();
      setAtencion(data.atencion || "");
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
  // BLOQUEOS ADMINISTRATIVOS
  // =========================
  if (adminError) {
    return <div>{adminError}</div>;
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

      ordering={ordering}
      orderError={orderError}
    />
  );
}
