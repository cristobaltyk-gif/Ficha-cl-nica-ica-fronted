import { useState, useEffect, useCallback } from "react";
import CajaDayView from "./CajaDayView";

const API_URL = import.meta.env.VITE_API_URL;

/*
CajaController — CEREBRO módulo caja

✔ Toda la lógica aquí
✔ CajaDayView solo pinta
✔ Se une al slot clínico por rut + date + time + professional
*/

export default function CajaController({ date, professional }) {
  const [slots,   setSlots]   = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // CARGA DEL DÍA
  // =========================
  const loadDay = useCallback(async () => {
    if (!date || !professional) return;
    setLoading(true);
    try {
      const [dayRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/api/caja/day?date=${date}&professional=${professional}`),
        fetch(`${API_URL}/api/caja/summary?date=${date}&professional=${professional}`)
      ]);
      const day = await dayRes.json();
      const sum = await sumRes.json();
      setSlots(day.slots || []);
      setSummary(sum);
    } catch {
      setSlots([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [date, professional]);

  useEffect(() => { loadDay(); }, [loadDay]);

  // =========================
  // MARCAR LLEGÓ
  // =========================
  async function handleLlego(time) {
    await patch({ time, arrival_status: "waiting" });
  }

  // =========================
  // MARCAR PAGADO
  // =========================
  async function handlePagado(time) {
    await patch({ time, pagado: true });
  }

  // =========================
  // CAMBIAR TIPO ATENCIÓN
  // =========================
  async function handleTipo(time, tipo_atencion) {
    await patch({ time, tipo_atencion });
  }

  // =========================
  // PATCH GENÉRICO
  // =========================
  async function patch(fields) {
    try {
      await fetch(`${API_URL}/api/caja/slot`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, professional, ...fields })
      });
      await loadDay();
    } catch {
      // backend decide errores
    }
  }

  // =========================
  // RENDER
  // =========================
  return (
    <CajaDayView
      date={date}
      professional={professional}
      slots={slots}
      summary={summary}
      loading={loading}
      onLlego={handleLlego}
      onPagado={handlePagado}
      onTipo={handleTipo}
      onRefresh={loadDay}
    />
  );
}
