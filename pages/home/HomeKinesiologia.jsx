import { useNavigate } from "react-router-dom";
import "../../styles/home/home-kine.css";

export default function HomeKinesiologia() {
  const navigate = useNavigate();

  return (
    <div className="home-kine">
      <header className="home-header">
        <h1>Kinesiología</h1>
        <p>Panel principal</p>
      </header>

      <section className="home-grid">

        {/* 📅 AGENDA */}
        <button
          className="home-card"
          onClick={() => navigate("/agenda")}
        >
          <span className="icon">📅</span>
          <span className="title">Agenda</span>
          <span className="desc">
            Ver pacientes del día y registrar sesión kinésica
          </span>
        </button>

        {/* 👥 PACIENTES */}
        <button
          className="home-card"
          onClick={() => navigate("/pacientes")}
        >
          <span className="icon">👥</span>
          <span className="title">Pacientes</span>
          <span className="desc">
            Buscar pacientes no agendados y ver historial
          </span>
        </button>

        {/* 📄 INFORMES */}
        <button
          className="home-card"
          onClick={() => navigate("/informes-kine")}
        >
          <span className="icon">📄</span>
          <span className="title">Informes</span>
          <span className="desc">
            Evolución, alta y reportes kinésicos
          </span>
        </button>

        {/* ⚙️ CONFIGURACIÓN */}
        <button
          className="home-card"
          onClick={() => navigate("/configuracion")}
        >
          <span className="icon">⚙️</span>
          <span className="title">Configuración</span>
          <span className="desc">
            Perfil profesional y ajustes personales
          </span>
        </button>

      </section>
    </div>
  );
}
