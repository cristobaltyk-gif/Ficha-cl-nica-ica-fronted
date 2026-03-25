import { useState, useEffect, useCallback } from "react";
import CajaResumenView from "./CajaResumenView";

const API_URL = import.meta.env.VITE_API_URL;

/*
CajaResumenController — CEREBRO módulo caja resumen
✔ Toda la lógica aquí
✔ CajaResumenView solo pinta
✔ Reutilizable desde cualquier cerebro de rol
*/

export default function CajaResumenController({ professionals = [] }) {
  const hoy = new Date().toISOString().slice(0, 10);

  const [date,         setDate]         = useState(hoy);
  const [professional, setProfessional] = useState("todos");
  const [resumen,      setResumen]      = useState(null);
  const [loading,      setLoading]      = useState(false);

  const loadResumen = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const url = professional === "todos"
        ? `${API_URL}/api/caja/resumen-dia?date=${date}`
        : `${API_URL}/api/caja/resumen-dia?date=${date}&professional=${professional}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("resumen");
      setResumen(await res.json());
    } catch {
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [date, professional]);

  useEffect(() => { loadResumen(); }, [loadResumen]);

  return (
    <CajaResumenView
      date={date}
      professional={professional}
      professionals={professionals}
      resumen={resumen}
      loading={loading}
      onDateChange={setDate}
      onProfessionalChange={setProfessional}
      onRefresh={loadResumen}
    />
  );
}
