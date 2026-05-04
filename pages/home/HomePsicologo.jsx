import "../../styles/home/home-secretaria.css";
import { useNavigate } from "react-router-dom";

const MODULOS = [
  { id: "agenda",        icon: "📅", title: "Agenda",    desc: "Tu calendario de atenciones" },
  { id: "pacientes",     icon: "🧑‍⚕️", title: "Pacientes", desc: "Buscar y revisar fichas" },
  { id: "configuracion", icon: "⚙️", title: "Configuración", desc: "Horarios y datos personales" },
];

export default function HomePsicologo() {
  const navigate = useNavigate();

  return (
    <div className="home-secretaria">
      <header className="home-header">
        <h1>Psicología</h1>
        <p>Panel de atención psicológica — Instituto de Cirugía Articular</p>
      </header>

      <section className="home-grid">
        {MODULOS.map(m => (
          <button
            key={m.id}
            className="home-card"
            onClick={() => navigate(m.id)}
            aria-label={m.title}
          >
            <span className="icon">{m.icon}</span>
            <span className="title">{m.title}</span>
            <span className="desc">{m.desc}</span>
          </button>
        ))}
      </section>
    </div>
  );
}
