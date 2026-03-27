import "../../styles/home/home-secretaria.css";
import { useNavigate } from "react-router-dom";

const MODULOS = [
  { id: "contable",       icon: "📊", title: "Contable",       desc: "Resumen mensual, ingresos, exportar PDF" },
  { id: "caja",           icon: "💰", title: "Caja del día",   desc: "Pagos del día por profesional" },
  { id: "profesionales",  icon: "🩺", title: "Profesionales",  desc: "Crear, editar y eliminar profesionales" },
  { id: "agenda",         icon: "📅", title: "Agenda",         desc: "Configurar horarios por profesional" },
  { id: "usuarios",       icon: "👤", title: "Usuarios",       desc: "Crear, editar y eliminar usuarios" },
  { id: "informes",       icon: "📋", title: "Informes",       desc: "Informes clínicos del centro" },
  { id: "configuracion",  icon: "⚙️", title: "Configuración",  desc: "Parámetros del sistema" },
];

export default function HomeAdmin() {
  const navigate = useNavigate();

  return (
    <div className="home-secretaria">
      <header className="home-header">
        <h1>Administración</h1>
        <p>Panel de gestión — Instituto de Cirugía Articular</p>
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
