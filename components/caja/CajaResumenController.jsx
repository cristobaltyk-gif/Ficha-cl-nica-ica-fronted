import { useState, useEffect, useCallback } from "react";
import CajaResumenView from "./CajaResumenView";

const API_URL = import.meta.env.VITE_API_URL;

/*
CajaResumenController — CEREBRO módulo caja resumen

Modos:
1. fechaFija + profesionalFijo → desde AgendaDayController (sin selectores)
2. profesionalFijo solo        → desde HomeMedico (selector día/semana/mes, profesional fijo)
3. Sin fijos                   → secretaria/admin (todo editable)
*/

// FIX: helper para construir headers con token
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CajaResumenController({
  professionals   = [],
  fechaFija       = null,
  profesionalFijo = null,
}) {
  const hoy = new Date().toISOString().slice(0, 10);

  const [date,         setDate]         = useState(fechaFija || hoy);
  const [professional, setProfessional] = useState(profesionalFijo || "todos");
  const [periodo,      setPeriodo]      = useState("dia"); // dia | semana | mes
  const [resumen,      setResumen]      = useState(null);
  const [loading,      setLoading]      = useState(false);

  const buildUrl = useCallback(() => {
    const prof = professional === "todos" ? null : professional;

    if (periodo === "dia") {
      const base = `${API_URL}/api/caja/resumen-dia?date=${date}`;
      return prof ? `${base}&professional=${prof}` : base;
    }

    if (periodo === "semana") {
      return null;
    }

    if (periodo === "mes") {
      const month = date.slice(0, 7);
      return `${API_URL}/api/caja/resumen-mes?month=${month}`;
    }

    return null;
  }, [date, professional, periodo]);

  const loadResumen = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setResumen(null);

    try {
      if (periodo === "semana") {
        const [y, m, d] = date.split("-").map(Number);
        const start = new Date(y, m - 1, d);
        const dias = Array.from({ length: 7 }, (_, i) => {
          const dt = new Date(start);
          dt.setDate(start.getDate() + i);
          return dt.toISOString().slice(0, 10);
        });

        const prof = professional === "todos" ? null : professional;
        const results = await Promise.all(
          dias.map(d => {
            const url = prof
              ? `${API_URL}/api/caja/resumen-dia?date=${d}&professional=${prof}`
              : `${API_URL}/api/caja/resumen-dia?date=${d}`;
            // FIX: token en cada fetch de semana
            return fetch(url, { headers: authHeaders() })
              .then(r => r.ok ? r.json() : null)
              .catch(() => null);
          })
        );

        let monto_total = 0;
        const por_tipo    = {};
        const por_metodo  = {};
        const pacientes   = [];
        const por_dia     = [];

        results.forEach((r, i) => {
          if (!r) return;
          monto_total += r.monto_total || 0;
          por_dia.push({ date: dias[i], monto: r.monto_total || 0 });
          Object.entries(r.por_tipo   || {}).forEach(([k, v]) => { por_tipo[k]   = (por_tipo[k]   || 0) + v; });
          Object.entries(r.por_metodo || {}).forEach(([k, v]) => { por_metodo[k] = (por_metodo[k] || 0) + v; });
          (r.pacientes || []).forEach(p => pacientes.push({ ...p, date: dias[i] }));
        });

        setResumen({ monto_total, por_tipo, por_metodo, pacientes, por_dia, periodo: "semana" });
        return;
      }

      const url = buildUrl();
      if (!url) return;
      // FIX: token en fetch principal
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error("resumen");
      const data = await res.json();
      setResumen({ ...data, periodo });

    } catch {
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [date, professional, periodo, buildUrl]);

  useEffect(() => { loadResumen(); }, [loadResumen]);

  return (
    <CajaResumenView
      date={date}
      professional={professional}
      professionals={professionals}
      resumen={resumen}
      loading={loading}
      periodo={periodo}
      fechaFija={fechaFija}
      profesionalFijo={profesionalFijo}
      onDateChange={fechaFija ? null : setDate}
      onProfessionalChange={profesionalFijo ? null : setProfessional}
      onPeriodoChange={fechaFija ? null : setPeriodo}
      onRefresh={loadResumen}
    />
  );
}
