import { useState, useEffect } from "react";
import "../styles/pacientes/dashboard-pacientes.css";

const API_URL = import.meta.env.VITE_API_URL;

const DIAS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DIAS_ES = { monday: "Lun", tuesday: "Mar", wednesday: "Mié",
                  thursday: "Jue", friday: "Vie", saturday: "Sáb", sunday: "Dom" };

export default function MedicosSecretaria() {
  const [professionals, setProfessionals] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [detalle,       setDetalle]       = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error();
        setProfessionals(await res.json());
      } catch {
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="dp-root">

      {/* HEADER */}
      <div className="dp-header">
        <div className="dp-header-left">
          <h1>{detalle ? detalle.name : "Profesionales"}</h1>
          {!detalle && <p>{professionals.length} profesionales activos</p>}
          {detalle && <p>{detalle.specialty || ""}</p>}
        </div>
        {detalle && (
          <button className="dp-btn-secondary" onClick={() => setDetalle(null)}>
            ← Volver
          </button>
        )}
      </div>

      <div className="dp-content">

        {loading && (
          <div className="dp-card">
            <p className="dp-empty">Cargando…</p>
          </div>
        )}

        {/* LISTA */}
        {!loading && !detalle && (
          <div className="dp-card">
            {professionals.length === 0 && (
              <p className="dp-empty">Sin profesionales registrados</p>
            )}
            {professionals.map((p, i) => (
              <div
                key={p.id}
                className="dp-event-row"
                onClick={() => setDetalle(p)}
                style={{ borderBottomColor: i < professionals.length - 1 ? "#f1f5f9" : "transparent" }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#0f172a", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, flexShrink: 0
                }}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="dp-event-diag">{p.name}</p>
                  <p className="dp-event-meta">{p.specialty || p.id}</p>
                </div>
                <svg className="dp-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* DETALLE PROFESIONAL */}
        {detalle && (
          <>
            <div className="dp-card">
              <div className="dp-field">
                <p className="dp-field-label">ID</p>
                <p className="dp-field-value">{detalle.id}</p>
              </div>
              {detalle.specialty && (
                <div className="dp-field">
                  <p className="dp-field-label">Especialidad</p>
                  <p className="dp-field-value">{detalle.specialty}</p>
                </div>
              )}
            </div>

            {/* HORARIO */}
            {detalle.schedule?.days && (
              <div className="dp-card">
                <p className="dp-label">Horario semanal</p>
                {DIAS.filter(d => detalle.schedule.days[d]).map(dia => {
                  const bloques = detalle.schedule.days[dia];
                  const slots = Array.isArray(bloques)
                    ? bloques
                    : bloques?.blocks || [];
                  return (
                    <div key={dia} className="dp-event-row" style={{ cursor: "default" }}>
                      <div style={{ width: 36, flexShrink: 0 }}>
                        <p className="dp-event-diag" style={{ fontSize: 13 }}>{DIAS_ES[dia]}</p>
                      </div>
                      <div style={{ flex: 1 }}>
                        {slots.map((b, i) => (
                          <p key={i} className="dp-event-meta" style={{ margin: "1px 0" }}>
                            {b.start} – {b.end}
                          </p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
