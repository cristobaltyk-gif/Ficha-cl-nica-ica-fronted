import { useState } from "react";
import "../styles/atencion/dashboard-atencion.css";

export default function DashboardAtencion({
  rut,
  date,
  time,
  professional
}) {
  // =========================
  // TEXTO CRUDO (WHISPER)
  // =========================
  const [rawConsultText, setRawConsultText] = useState("");

  // =========================
  // TEXTO CLÍNICO EDITABLE
  // =========================
  const [atencion, setAtencion] = useState("");
  const [receta, setReceta] = useState("");
  const [examenes, setExamenes] = useState("");

  // =========================
  // ESTADOS UI
  // =========================
  const [recording, setRecording] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // =========================
  // WHISPER (STUB)
  // =========================
  async function handleWhisper() {
    if (recording) {
      // detener grabación (backend después)
      setRecording(false);
      return;
    }

    setRecording(true);

    // ⛔ STUB
    // const transcript = await whisper(...)
    const transcript = "\n[Texto transcrito por Whisper]";

    setRawConsultText(prev => prev + transcript);
    setRecording(false);
  }

  // =========================
  // GPT ORDENAR (STUB)
  // =========================
  async function handleOrderClinically() {
    if (!rawConsultText) return;

    setOrdering(true);

    // ⛔ STUB
    // const result = await gptOrder(rawConsultText)

    const result = {
      atencion: "Texto clínico ordenado…",
      receta: "Receta generada…",
      examenes: "Exámenes solicitados…",
      orden_kinesica: "Orden kinésica…",
      indicaciones: "Indicaciones al paciente…",
      indicacion_quirurgica: "Evaluar cirugía…"
    };

    setAtencion(result.atencion);
    setReceta(result.receta);
    setExamenes(result.examenes);

    setOrdering(false);
  }

  // =========================
  // RENDER
  // =========================
  return (
    <div className="dashboard dashboard-atencion">
      <header className="dashboard-header">
        <h1>Atención Clínica</h1>

        <div className="dashboard-meta">
          <span><strong>Paciente:</strong> {rut}</span>
          <span><strong>Fecha:</strong> {date} {time}</span>
          <span><strong>Profesional:</strong> {professional}</span>
        </div>

        <div className="dashboard-actions">
          <button
            className={recording ? "danger" : "primary"}
            onClick={handleWhisper}
          >
            {recording ? "⏹ Detener dictado" : "🎙 Dictar consulta"}
          </button>

          <button
            className="secondary"
            disabled={!rawConsultText || ordering}
            onClick={handleOrderClinically}
          >
            🧠 Ordenar clínicamente
          </button>
        </div>
      </header>

      <main className="dashboard-body atencion-layout">
        {/* ATENCIÓN */}
        <section className="panel">
          <div className="panel-header">Atención</div>
          <div className="panel-body">
            <textarea
              value={atencion}
              onChange={(e) => setAtencion(e.target.value)}
              placeholder="Escribe o genera la atención clínica…"
            />
          </div>
        </section>

        {/* RECETA */}
        <section className="panel">
          <div className="panel-header">Receta</div>
          <div className="panel-body">
            <textarea
              value={receta}
              onChange={(e) => setReceta(e.target.value)}
              placeholder="Receta médica…"
            />
          </div>
        </section>

        {/* EXÁMENES */}
        <section className="panel">
          <div className="panel-header">Exámenes</div>
          <div className="panel-body">
            <textarea
              value={examenes}
              onChange={(e) => setExamenes(e.target.value)}
              placeholder="Exámenes solicitados…"
            />
          </div>
        </section>
      </main>

      {/* ACCIONES CLÍNICAS */}
      <footer className="dashboard-footer">
        <button className="secondary">🦵 Orden kinésica</button>
        <button className="secondary">📝 Indicaciones</button>
        <button className="secondary">🔪 Indicación quirúrgica</button>
      </footer>
    </div>
  );
}
