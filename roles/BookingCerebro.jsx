import { useEffect, useMemo, useState } from "react";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import { useAuth } from "../auth/AuthContext";
import PublicLayout from "../pages/reservas/PublicBookingLayout";

const API_URL       = import.meta.env.VITE_API_URL;
const PREDIAG_URL   = "https://asistencia-ica-backend.onrender.com";  // backend prediagnóstico
const PREDIAG_FRONT = "https://app.icarticular.cl";                   // frontend prediagnóstico

// ── Zonas disponibles ────────────────────────────────────────
const ZONAS_DOLOR = [
  "Rodilla", "Cadera", "Hombro", "Codo",
  "Mano", "Tobillo", "Columna cervical",
  "Columna dorsal", "Columna lumbar",
];

// ── Estilos ──────────────────────────────────────────────────
const S = {
  bannerWrap: {
    background: "#f0f7ff",
    border: "1px solid #bfdbfe",
    borderRadius: 16,
    padding: "20px 20px 16px",
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 15, fontWeight: 700, color: "#1e3a5f", marginBottom: 4 },
  bannerSub:   { fontSize: 13, color: "#475569", marginBottom: 14, lineHeight: 1.5 },
  zonaGrid:    { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  zonaBtn: (active) => ({
    padding: "7px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
    cursor: "pointer", transition: "all 0.15s",
    background: active ? "#1d4ed8" : "#fff",
    color:      active ? "#fff"    : "#334155",
    border:     active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  }),
  derivRow: {
    background: "#fff", border: "1px solid #bfdbfe",
    borderRadius: 12, padding: "12px 16px",
    marginBottom: 8,
  },
  derivText: { fontSize: 14, color: "#1e3a5f", fontWeight: 500 },
  derivSub:  { fontSize: 12, color: "#64748b", marginTop: 2 },
  skipBtn: {
    background: "none", border: "none", color: "#94a3b8",
    fontSize: 12, cursor: "pointer", textDecoration: "underline",
    padding: 0,
  },
  btnConsultar: {
    background: "#1d4ed8", color: "#fff", border: "none",
    borderRadius: 10, padding: "10px 20px", fontSize: 14,
    fontWeight: 700, cursor: "pointer",
  },
  // Modal
  modalBack: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: 16,
  },
  modalCard: {
    background: "#fff", borderRadius: 20, padding: 28,
    maxWidth: 480, width: "100%",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalTitle: { fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 },
  modalSub:   { fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 20 },
  modalBullets: { listStyle: "none", padding: 0, marginBottom: 20 },
  modalBullet: {
    fontSize: 13, color: "#334155", padding: "6px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  btnPrimary: {
    background: "#1d4ed8", color: "#fff", border: "none",
    borderRadius: 12, padding: "12px 20px", fontSize: 14,
    fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 10,
  },
  btnSecondary: {
    background: "none", border: "1px solid #e2e8f0",
    borderRadius: 12, padding: "11px 20px", fontSize: 14,
    fontWeight: 600, cursor: "pointer", width: "100%", color: "#475569",
  },
};

// ── Banner Punto 1: derivación por síntomas ──────────────────
function BannerDerivacion({ onDerivacion, onSkip }) {
  const [zona, setZona]       = useState("");
  const [lado, setLado]       = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const tieneColumna = zona.toLowerCase().includes("columna");

  async function handleConsultar() {
    if (!zona) return;
    setLoading(true);
    try {
      // Geo silencioso
      let geo = null;
      try {
        const gRes = await fetch(`${PREDIAG_URL}/geo-ping`, { method: "GET" });
        if (gRes.ok) geo = (await gRes.json()).geo;
      } catch {}

      // Llamar resolver en backend prediagnóstico
      const dolor = zona.toLowerCase() + (lado ? ` ${lado.toLowerCase()}` : "");
      const resp = await fetch(`${PREDIAG_URL}/resolver-derivacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dolor, geo }),
      });

      let especialidad = zona.toLowerCase().split(" ")[0];
      let nota = "";
      if (resp.ok) {
        const j = await resp.json();
        especialidad = j?.especialidad || especialidad;
        nota = j?.nota || "";
      }

      const res = { especialidad, zona, lado, nota };
      setResultado(res);
      onDerivacion?.(res);
    } catch {
      const res = { especialidad: zona.toLowerCase().split(" ")[0], zona, lado, nota: "" };
      setResultado(res);
      onDerivacion?.(res);
    } finally {
      setLoading(false);
    }
  }

  if (resultado) {
    const espLabel = resultado.especialidad.charAt(0).toUpperCase() + resultado.especialidad.slice(1);
    return (
      <div style={S.bannerWrap}>
        <div style={S.bannerTitle}>✓ Recomendación según sus síntomas</div>
        <div style={S.derivRow}>
          <div style={S.derivText}>
            Especialista en <strong>{espLabel}</strong>
          </div>
          <div style={S.derivSub}>
            Mostrando primero los profesionales más indicados para{" "}
            {resultado.zona.toLowerCase()}{resultado.lado ? ` ${resultado.lado.toLowerCase()}` : ""}.
          </div>
        </div>
        <button style={S.skipBtn} onClick={onSkip}>
          Ver todos los profesionales igual
        </button>
      </div>
    );
  }

  return (
    <div style={S.bannerWrap}>
      <div style={S.bannerTitle}>¿Dónde presenta molestias?</div>
      <div style={S.bannerSub}>
        Opcional — le ayudamos a encontrar el especialista más indicado según sus síntomas.
      </div>

      <div style={S.zonaGrid}>
        {ZONAS_DOLOR.map((z) => (
          <button key={z} style={S.zonaBtn(zona === z)} onClick={() => { setZona(z); setLado(""); }}>
            {z}
          </button>
        ))}
      </div>

      {zona && !tieneColumna && (
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["Derecha", "Izquierda"].map((l) => (
            <button key={l} style={S.zonaBtn(lado === l)} onClick={() => setLado(lado === l ? "" : l)}>
              {l}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button style={S.btnConsultar} onClick={handleConsultar} disabled={!zona || loading}>
          {loading ? "Consultando…" : "Buscar especialista →"}
        </button>
        <button style={S.skipBtn} onClick={onSkip}>Saltar</button>
      </div>
    </div>
  );
}

// ── Modal Punto 2: oferta prediagnóstico post-reserva ────────
function ModalPrediagnostico({ paciente, zona, onClose }) {
  const params = new URLSearchParams({
    nombre: paciente?.nombre || "",
    rut:    paciente?.rut    || "",
    origen: "reserva",
    dolor:  zona             || "",
  });
  const url = `${PREDIAG_FRONT}?${params.toString()}`;

  return (
    <div style={S.modalBack} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modalCard}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🩺</div>
        <div style={S.modalTitle}>¿Quiere llegar preparado a su consulta?</div>
        <div style={S.modalSub}>
          Nuestro asistente IA puede sugerirle los exámenes que necesitará,
          validados por su especialista. Ahorre tiempo y llegue listo.
        </div>
        <ul style={S.modalBullets}>
          {[
            "✓ Diagnóstico presuntivo con IA",
            "✓ Orden de exámenes firmada digitalmente",
            "✓ Validada por su médico en la consulta",
            "✓ Ahorre tiempo el día de su cita",
          ].map((item) => (
            <li key={item} style={S.modalBullet}>{item}</li>
          ))}
        </ul>
        <button style={S.btnPrimary} onClick={() => { window.open(url, "_blank"); onClose(); }}>
          Iniciar prediagnóstico IA →
        </button>
        <button style={S.btnSecondary} onClick={onClose}>No por ahora</button>
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function BookingCerebro() {
  const { session, login } = useAuth();

  const [professionals, setProfessionals]     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [loadError, setLoadError]             = useState("");
  const [selectedDay, setSelectedDay]         = useState(null);
  const [patientOpen, setPatientOpen]         = useState(false);
  const [pendingSlot, setPendingSlot]         = useState(null);
  const [agendaReloadKey, setAgendaReloadKey] = useState(0);
  const [reserving, setReserving]             = useState(false);
  const [reserveError, setReserveError]       = useState("");

  // Prediagnóstico
  const [mostrarBanner, setMostrarBanner] = useState(true);
  const [derivacion, setDerivacion]       = useState(null);
  const [lastPatient, setLastPatient]     = useState(null);
  const [showPrediag, setShowPrediag]     = useState(false);

  const apiOk = useMemo(() => typeof API_URL === "string" && API_URL.length > 5, []);

  useEffect(() => {
    if (!session) {
      login({
        usuario: "public_web",
        role: { name: "public", entry: "/reservas", allow: ["agenda_public"] },
        professional: "system",
      });
    }
  }, [session, login]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setLoadError(""); setReserveError("");
      if (!apiOk) {
        if (!cancelled) { setProfessionals([]); setLoadError("Falta VITE_API_URL."); setLoading(false); }
        return;
      }
      try {
        const res  = await fetch(`${API_URL}/professionals`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          const list = Array.isArray(data) ? data : Array.isArray(data?.professionals) ? data.professionals : [];
          setProfessionals(list.map((p) => ({ id: p.id, name: p.name, specialty: p.specialty })));
        }
      } catch {
        if (!cancelled) { setProfessionals([]); setLoadError("No se pudo cargar la lista de profesionales."); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [apiOk]);

  // Reordenar profesionales por especialidad derivada
  const professionalsFiltrados = useMemo(() => {
    if (!derivacion?.especialidad || !professionals.length) return professionals;
    const esp = derivacion.especialidad.toLowerCase();
    const match = professionals.filter(
      (p) => p.name?.toLowerCase().includes(esp) || p.specialty?.toLowerCase().includes(esp)
    );
    if (!match.length) return professionals;
    const resto = professionals.filter((p) => !match.includes(p));
    return [...match, ...resto];
  }, [professionals, derivacion]);

  function handleAttend(slot) {
    if (reserving || !slot || slot.status !== "available") return;
    setReserveError("");
    setPendingSlot(slot);
    setPatientOpen(true);
  }

  async function reserveSlot(rut) {
    if (!pendingSlot || !rut) { setReserveError("RUT inválido."); return; }
    if (!apiOk) { setReserveError("Backend no configurado."); return; }

    const { date, time, professional } = pendingSlot;
    setReserving(true); setReserveError("");

    try {
      const res = await fetch(`${API_URL}/agenda/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, professional, rut }),
      });

      if (!res.ok) {
        let msg = "No se pudo reservar.";
        try { const j = await res.json(); msg = j?.detail || j?.error || j?.message || msg; } catch {}
        throw new Error(msg);
      }

      setAgendaReloadKey((k) => k + 1);
      setPatientOpen(false);
      setPendingSlot(null);
      setLastPatient({ rut });

      // ← Punto 2: mostrar modal prediagnóstico
      setShowPrediag(true);

    } catch (e) {
      setReserveError(e?.message || "Error reservando la hora.");
    } finally {
      setReserving(false);
    }
  }

  function handleBack() {
    setReserveError(""); setPendingSlot(null);
    setPatientOpen(false); setSelectedDay(null);
  }

  return (
    <PublicLayout>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Reservas</div>
          <div style={{ fontSize: 13, color: "#475569" }}>
            {selectedDay ? "Selecciona un horario disponible" : "Selecciona día y profesional"}
          </div>
        </div>
        {selectedDay && (
          <button onClick={handleBack} style={{ border: "1px solid #e2e8f0", background: "#fff", borderRadius: 12, padding: "10px 12px", cursor: "pointer", fontWeight: 700, color: "#0f172a" }}>
            ← Volver
          </button>
        )}
      </div>

      {/* Errores */}
      {loadError    && <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 }}>{loadError}</div>}
      {reserveError && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 }}>{reserveError}</div>}

      {!selectedDay ? (
        <>
          {/* ── Punto 1: Banner síntomas ── */}
          {mostrarBanner && (
            <BannerDerivacion
              onDerivacion={(d) => { setDerivacion(d); setMostrarBanner(false); }}
              onSkip={() => setMostrarBanner(false)}
            />
          )}

          {loading ? (
            <div className="agenda-placeholder">Cargando agenda…</div>
          ) : professionals.length === 0 ? (
            <div className="agenda-placeholder">Sin profesionales disponibles.</div>
          ) : (
            <>
              {derivacion && (
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>
                  Mostrando especialistas en <strong>{derivacion.especialidad}</strong> primero ·{" "}
                  <button style={S.skipBtn} onClick={() => setDerivacion(null)}>ver todos</button>
                </div>
              )}
              <AgendaSummarySelector professionals={professionalsFiltrados} onSelectDay={setSelectedDay} />
            </>
          )}
        </>
      ) : (
        <>
          <AgendaDayController
            key={agendaReloadKey}
            professional={selectedDay.professional}
            date={selectedDay.date}
            role="PUBLIC"
            onAttend={handleAttend}
          />
          <PatientForm
            open={patientOpen}
            loading={reserving}
            onConfirm={(patient) => reserveSlot(patient?.rut)}
            onCreate={(patient)  => reserveSlot(patient?.rut)}
            onCancel={() => {
              if (reserving) return;
              setPendingSlot(null); setPatientOpen(false); setReserveError("");
            }}
          />
        </>
      )}

      {/* ── Punto 2: Modal prediagnóstico post-reserva ── */}
      {showPrediag && (
        <ModalPrediagnostico
          paciente={lastPatient}
          zona={derivacion?.zona || ""}
          onClose={() => setShowPrediag(false)}
        />
      )}

    </PublicLayout>
  );
}
