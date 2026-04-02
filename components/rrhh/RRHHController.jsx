import { useState, useEffect, useCallback } from "react";
import RRHHView from "./RRHHView";

const API_URL = import.meta.env.VITE_API_URL;

export default function RRHHController() {
  const hoy = new Date().toISOString().slice(0, 7);

  const [mes,           setMes]           = useState(hoy);
  const [trabajadores,  setTrabajadores]  = useState([]);
  const [liquidaciones, setLiquidaciones] = useState(null);
  const [tasas,         setTasas]         = useState(null);
  const [loading,       setLoading]       = useState(false);

  const [tab, setTab] = useState("trabajadores"); // trabajadores | liquidaciones | tasas

  // Modales
  const [trabajadorOpen,    setTrabajadorOpen]    = useState(false);
  const [trabajadorEditing, setTrabajadorEditing] = useState(null);
  const [exporting,         setExporting]         = useState(false);
  const [registrando,       setRegistrando]       = useState(false);

  const loadTrabajadores = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/rrhh/trabajadores`);
      if (res.ok) setTrabajadores(await res.json());
    } catch {}
  }, []);

  const loadTasas = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/rrhh/tasas`);
      if (res.ok) setTasas(await res.json());
    } catch {}
  }, []);

  const loadLiquidaciones = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rrhh/liquidaciones/${mes}`);
      if (res.ok) setLiquidaciones(await res.json());
      else setLiquidaciones(null);
    } catch {
      setLiquidaciones(null);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => { loadTrabajadores(); loadTasas(); }, []);
  useEffect(() => { if (tab === "liquidaciones") loadLiquidaciones(); }, [tab, mes]);

  async function handleGuardarTrabajador(data) {
    try {
      if (trabajadorEditing) {
        await fetch(`${API_URL}/api/rrhh/trabajadores/${trabajadorEditing.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(data)
        });
      } else {
        await fetch(`${API_URL}/api/rrhh/trabajadores`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(data)
        });
      }
      setTrabajadorOpen(false);
      setTrabajadorEditing(null);
      await loadTrabajadores();
    } catch {}
  }

  async function handleEliminar(id) {
    try {
      await fetch(`${API_URL}/api/rrhh/trabajadores/${id}`, { method: "DELETE" });
      await loadTrabajadores();
    } catch {}
  }

  async function handleDescargarPDF(tid) {
    try {
      const res = await fetch(`${API_URL}/api/rrhh/liquidacion/${tid}/${mes}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `liquidacion_${tid}_${mes}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {}
  }

  async function handleExportarExcel() {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/api/rrhh/liquidaciones/${mes}/excel`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `remuneraciones_${mes}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {} finally {
      setExporting(false);
    }
  }

  async function handleRegistrarGasto() {
    setRegistrando(true);
    try {
      await fetch(`${API_URL}/api/rrhh/liquidaciones/${mes}/registrar-gasto`, {
        method: "POST"
      });
      alert("✅ Sueldos registrados en gastos contables");
    } catch {} finally {
      setRegistrando(false);
    }
  }

  async function handleGuardarTasas(nuevasTasas) {
    try {
      await fetch(`${API_URL}/api/rrhh/tasas`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(nuevasTasas)
      });
      await loadTasas();
      alert("✅ Tasas actualizadas");
    } catch {}
  }

  return (
    <RRHHView
      mes={mes}
      tab={tab}
      trabajadores={trabajadores}
      liquidaciones={liquidaciones}
      tasas={tasas}
      loading={loading}
      exporting={exporting}
      registrando={registrando}
      trabajadorOpen={trabajadorOpen}
      trabajadorEditing={trabajadorEditing}
      onMesChange={setMes}
      onTabChange={setTab}
      onNuevoTrabajador={() => { setTrabajadorEditing(null); setTrabajadorOpen(true); }}
      onEditarTrabajador={(t) => { setTrabajadorEditing(t); setTrabajadorOpen(true); }}
      onEliminarTrabajador={handleEliminar}
      onGuardarTrabajador={handleGuardarTrabajador}
      onCerrarTrabajador={() => { setTrabajadorOpen(false); setTrabajadorEditing(null); }}
      onDescargarPDF={handleDescargarPDF}
      onExportarExcel={handleExportarExcel}
      onRegistrarGasto={handleRegistrarGasto}
      onGuardarTasas={handleGuardarTasas}
      onRefresh={loadLiquidaciones}
    />
  );
}
  
