import { useEffect, useMemo, useState } from "react";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import AgendaDayController from "../components/agenda/AgendaDayController";
import PatientForm from "../components/patient/PatientForm";
import { useAuth } from "../auth/AuthContext";
import PublicLayout from "../pages/reservas/PublicBookingLayout";

const API_URL      = import.meta.env.VITE_API_URL;
const PREDIAG_FRONT = "https://app.icarticular.cl";

// ── Modal publicitario post-reserva ─────────────────────────
function ModalPrediagnostico({ rut, nombre, onClose }) {
  const params = new URLSearchParams({
    nombre: nombre || "",
    rut:    rut    || "",
    origen: "reserva",
  });
  const url = `${PREDIAG_FRONT}?${params.toString()}`;

  const S = {
    back: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16,
    },
    card: {
      background: "#fff", borderRadius: 20, padding: 28,
      maxWidth: 440, width: "100%",
      boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    },
    title: { fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 8 },
    sub:   { fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 20 },
    list:  { listStyle: "none", padding: 0, marginBottom: 20 },
    item:  { fontSize: 13, color: "#334155", padding: "6px 0", borderBottom: "1px solid #f1f5f9" },
    btnP:  {
      background: "#1d4ed8", color: "#fff", border: "none",
      borderRadius: 12, padding: "12px 20px", fontSize: 14,
      fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 10,
    },
    btnS:  {
      background: "none", border: "1px solid #e2e8f0", borderRadius: 12,
      padding: "11px 20px", fontSize: 14, fontWeight: 600,
      cursor: "pointer", width: "100%", color: "#475569",
    },
  };

  return (
    <div style={S.back} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.card}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🩺</div>
        <div style={S.title}>¿Quiere llegar preparado a su consulta?</div>
        <div style={S.sub}>
          Nuestro asistente IA puede sugerirle los exámenes que necesitará,
          validados por su médico. Ahorre tiempo y llegue listo.
        </div>
        <ul style={S.list}>
          {[
            "✓ Diagnóstico presuntivo con IA",
            "✓ Orden de exámenes firmada digitalmente",
            "✓ Validada por su médico en la consulta",
            "✓ Ahorre tiempo el día de su cita",
          ].map((item) => (
            <li key={item} style={S.item}>{item}</li>
          ))}
        </ul>
        <button style={S.btnP} onClick={() => { window.open(url, "_blank"); onClose(); }}>
          Iniciar prediagnóstico IA →
        </button>
        <button style={S.btnS} onClick={onClose}>No por ahora</button>
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

  // Modal prediagnóstico
  const [showPrediag, setShowPrediag] = useState(false);
  const [lastPatient, setLastPatient] = useState(null);

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
    async function loadProfessionals() {
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
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.professionals)
              ? data.professionals
              : [];
          setProfessionals(list.map((p) => ({ id: p.id, name: p.name })));
        }
      } catch {
        if (!cancelled) { setProfessionals([]); setLoadError("No se pudo cargar la lista de profesionales."); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadProfessionals();
    return () => { cancelled = true; };
  }, [apiOk]);

  function handleAttend(slot) {
    if (reserving || !slot || slot.status !== "available") return;
    setReserveError("");
    setPendingSlot(slot);
    setPatientOpen(true);
  }

  async function reserveSlot(patient) {
    if (!pendingSlot) return;
    const rut = patient?.rut;
    if (!rut) { setReserveError("RUT inválido."); return; }
    if (!apiOk) { setReserveError("Backend no configurado (VITE_API_URL)."); return; }

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

      // Guardar datos para el modal y mostrarlo
      setLastPatient({ rut, nombre: patient?.nombre || "" });
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
      {loadError && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", color: "#9a3412", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 }}>
          {loadError}
        </div>
      )}
      {reserveError && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", padding: 12, borderRadius: 12, marginBottom: 12, fontWeight: 700 }}>
          {reserveError}
        </div>
      )}

      {!selectedDay ? (
        loading ? (
          <div className="agenda-placeholder">Cargando agenda…</div>
        ) : professionals.length === 0 ? (
          <div className="agenda-placeholder">Sin profesionales disponibles.</div>
        ) : (
          <AgendaSummarySelector professionals={professionals} onSelectDay={setSelectedDay} />
        )
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
            onConfirm={(patient) => reserveSlot(patient)}
            onCreate={(patient)  => reserveSlot(patient)}
            onCancel={() => {
              if (reserving) return;
              setPendingSlot(null); setPatientOpen(false); setReserveError("");
            }}
          />
        </>
      )}

      {/* Modal prediagnóstico post-reserva */}
      {showPrediag && (
        <ModalPrediagnostico
          rut={lastPatient?.rut}
          nombre={lastPatient?.nombre}
          onClose={() => setShowPrediag(false)}
        />
      )}

    </PublicLayout>
  );
}
