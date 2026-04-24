import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

export default function ComisionProfesionalForm({ professional }) {
  const pid = professional.id;

  const [porcentaje, setPorcentaje] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);
  const [success,    setSuccess]    = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch("/api/caja/comisiones");
        if (res.ok) {
          const data = await res.json();
          setPorcentaje(data[pid] ?? data["default"] ?? 20);
        }
      } catch {
        setError("Error cargando comisión");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pid]);

  async function handleGuardar() {
    setError(null); setSuccess(null); setSaving(true);
    try {
      const val = Number(porcentaje);
      if (isNaN(val) || val < 0 || val > 100) {
        setError("El porcentaje debe ser entre 0 y 100");
        return;
      }
      const res = await apiFetch(`/api/caja/comisiones/${pid}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ porcentaje: val }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setSuccess("✓ Comisión guardada correctamente");
      setTimeout(() => setSuccess(null), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="ea-empty">Cargando…</p>;

  return (
    <div>
      {error   && <div className="ea-error">{error}</div>}
      {success && <div className="ea-success">{success}</div>}

      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
        Define el porcentaje de retención del centro sobre los ingresos de este profesional.
      </p>

      <div className="ea-field">
        <p className="ea-field-label">Porcentaje de comisión (%)</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            className="ea-input"
            type="number"
            min="0"
            max="100"
            value={porcentaje}
            onChange={e => setPorcentaje(e.target.value)}
            style={{ maxWidth: 120 }}
          />
          <span style={{ fontSize: 14, color: "#64748b" }}>%</span>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
          El profesional recibirá el {100 - Number(porcentaje || 0)}% de sus ingresos.
        </p>
      </div>

      <button
        className="ea-btn-primary"
        onClick={handleGuardar}
        disabled={saving}
        style={{ marginTop: 8 }}
      >
        {saving ? "Guardando…" : "Guardar comisión"}
      </button>
    </div>
  );
}
