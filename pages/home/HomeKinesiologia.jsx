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

        <button className="home-card" onClick={() => navigate("agenda")}>
          <span className="icon">📅</span>
          <span className="title">Agenda</span>
          <span className="desc">Ver pacientes del día y registrar sesión kinésica</span>
        </button>

        <button className="home-card" onClick={() => navigate("pacientes")}>
          <span className="icon">👥</span>
          <span className="title">Pacientes</span>
          <span className="desc">Buscar pacientes no agendados y ver historial</span>
        </button>

        <button className="home-card" onClick={() => navigate("pagos")}>
          <span className="icon">💰</span>
          <span className="title">Pagos</span>
          <span className="desc">Resumen de pagos por día o mes</span>
        </button>

        <button className="home-card" onClick={() => navigate("configuracion")}>
          <span className="icon">⚙️</span>
          <span className="title">Configuración</span>
          <span className="desc">Perfil profesional y ajustes personales</span>
        </button>

      </section>
    </div>
  );
}
