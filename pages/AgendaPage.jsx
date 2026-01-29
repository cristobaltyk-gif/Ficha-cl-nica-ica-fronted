import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import Agenda from "../components/agenda/Agenda";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import CalendarMonthView from "../components/agenda/CalendarMonthView";

const API_URL = import.meta.env.VITE_API_URL;

/*
AgendaPage (ORQUESTADOR CENTRAL)

✔ Secretaría
✔ Selección de médico
✔ Vista mensual
✔ Click día → agenda diaria
✔ NO pinta slots
✔ NO pinta calendario
✔ Coordina estado global
*/

export default function AgendaPage() {
  const { session } = useAuth();

  // =========================
  // Estado global
  // =========================
  const [professional, setProfessional] = useState(null); // id u objeto
  const [selectedDate, setSelectedDate] = useState(null); // { date }
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // =========================
  // Render
  // =========================
  return (
    <div className="agenda-page">
      {/* =========================
          Selector de médico
      ========================== */}
      <AgendaSummarySelector
        value={professional}
        onChange={(p) => {
          setProfessional(p);
          setSelectedDate(null); // reset día al cambiar médico
        }}
      />

      {/* =========================
          Vista mensual (Secretaría)
      ========================== */}
      {professional && (
        <CalendarMonthView
          professional={professional}
          month={month}
          selectedDate={selectedDate}
          onSelectDate={(day) => setSelectedDate(day)}
        />
      )}

      {/* =========================
          Agenda diaria
      ========================== */}
      {professional && selectedDate && (
        <Agenda
          professional={professional}
          date={selectedDate.date}
        />
      )}
    </div>
  );
}
