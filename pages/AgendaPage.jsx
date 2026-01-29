import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

import Agenda from "../components/agenda/Agenda";
import AgendaSummarySelector from "../components/agenda/AgendaSummarySelector";
import CalendarMonthView from "../components/agenda/CalendarMonthView";

/*
AgendaPage (ORQUESTADOR CENTRAL)

✔ Secretaría
✔ Selección de médico (1)
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
  const [professional, setProfessional] = useState(null); // id del médico
  const [selectedDate, setSelectedDate] = useState(null); // { date }
  const [month] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // =========================
  // Profesionales (TEMPORAL / MOCK)
  // 👉 luego vendrá del backend
  // =========================
  const professionals = [
    { id: "medico1", name: "Dr. Médico 1" },
    { id: "medico2", name: "Dr. Médico 2" },
  ];

  // =========================
  // Render
  // =========================
  return (
    <div className="agenda-page">

      {/* =========================
          Selector de médico
      ========================== */}
      <AgendaSummarySelector
        professionals={professionals}
        max={1} // secretaría: 1 médico a la vez
        defaultMode="monthly"
        onChange={({ selectedProfessionals }) => {
          const p = selectedProfessionals[0] || null;
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
