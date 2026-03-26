import { useState, useEffect, useCallback } from "react";
import ContableView from "./ContableView";

const API_URL = import.meta.env.VITE_API_URL;

/*
ContableController — CEREBRO módulo contable mensual
✔ Toda la lógica aquí
✔ ContableView solo pinta
✔ Reutilizable desde cualquier cerebro de rol
*/

export default function ContableController() {
  const hoy   = new Date();
  const mesHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;

  const [month,   setMonth]   = useState(mesHoy);
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadResumen = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/caja/resumen-mes?month=${month}`);
      if (!res.ok) throw new Error("resumen-mes");
      setResumen(await res.json());
    } catch {
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { loadResumen(); }, [loadResumen]);

  async function handleExportPDF() {
    try {
      const res = await fetch(`${API_URL}/api/caja/pdf-mes?month=${month}`);
      if (!res.ok) throw new Error("pdf");
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Error al generar el PDF");
    }
  }

  return (
    <ContableView
      month={month}
      resumen={resumen}
      loading={loading}
      onMonthChange={setMonth}
      onRefresh={loadResumen}
      onExportPDF={handleExportPDF}
    />
  );
}
