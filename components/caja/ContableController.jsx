import { useState, useEffect, useCallback } from "react";
import ContableView from "./ContableView";

const API_URL = import.meta.env.VITE_API_URL;

export default function ContableController() {
  const hoy = new Date().toISOString().slice(0, 7); // YYYY-MM

  const [mes,       setMes]       = useState(hoy);
  const [resumen,   setResumen]   = useState(null);
  const [config,    setConfig]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [exporting, setExporting] = useState(false);

  // Modal gasto
  const [gastoOpen,    setGastoOpen]    = useState(false);
  const [gastoEditing, setGastoEditing] = useState(null);

  // Modal categoría
  const [catOpen,  setCatOpen]  = useState(false);
  const [catGrupo, setCatGrupo] = useState("");

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/contable/gastos/config`);
      if (res.ok) setConfig(await res.json());
    } catch {}
  }, []);

  const loadResumen = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contable/resumen/${mes}`);
      if (res.ok) setResumen(await res.json());
      else setResumen(null);
    } catch {
      setResumen(null);
    } finally {
      setLoading(false);
    }
  }, [mes]);

  useEffect(() => { loadConfig(); }, [loadConfig]);
  useEffect(() => { loadResumen(); }, [loadResumen]);

  async function handleGuardarGasto(data) {
    try {
      if (gastoEditing) {
        await fetch(`${API_URL}/api/contable/gastos/${gastoEditing.id}`, {
          method:  "PUT",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ descripcion: data.descripcion, monto: data.monto })
        });
      } else {
        await fetch(`${API_URL}/api/contable/gastos`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ ...data, mes })
        });
      }
      setGastoOpen(false);
      setGastoEditing(null);
      await loadResumen();
    } catch {}
  }

  async function handleEliminarGasto(id) {
    try {
      await fetch(`${API_URL}/api/contable/gastos/${id}`, { method: "DELETE" });
      await loadResumen();
    } catch {}
  }

  async function handleAgregarCategoria(categoria) {
    try {
      await fetch(`${API_URL}/api/contable/gastos/config/categoria`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ grupo: catGrupo, categoria })
      });
      setCatOpen(false);
      await loadConfig();
    } catch {}
  }

  async function handleExportar() {
    setExporting(true);
    try {
      const res = await fetch(`${API_URL}/api/contable/exportar/${mes}`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `contable_${mes}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {} finally {
      setExporting(false);
    }
  }

  return (
    <ContableView
      mes={mes}
      resumen={resumen}
      config={config}
      loading={loading}
      exporting={exporting}
      gastoOpen={gastoOpen}
      gastoEditing={gastoEditing}
      catOpen={catOpen}
      catGrupo={catGrupo}
      onMesChange={setMes}
      onRefresh={loadResumen}
      onExportar={handleExportar}
      onNuevoGasto={() => { setGastoEditing(null); setGastoOpen(true); }}
      onEditarGasto={(g) => { setGastoEditing(g); setGastoOpen(true); }}
      onEliminarGasto={handleEliminarGasto}
      onGuardarGasto={handleGuardarGasto}
      onCerrarGasto={() => { setGastoOpen(false); setGastoEditing(null); }}
      onAbrirCategoria={(grupo) => { setCatGrupo(grupo); setCatOpen(true); }}
      onGuardarCategoria={handleAgregarCategoria}
      onCerrarCategoria={() => setCatOpen(false)}
    />
  );
}
