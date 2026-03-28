import { useNavigate } from "react-router-dom";
import "../../styles/home/home-medico.css";

export default function HomeMedico() {
  const navigate = useNavigate();

  return (
    <div className="home-medico">
      <header className="home-header">
        <h1>Médico</h1>
        <p>Panel principal</p>
      </header>

      <section className="home-grid">

        <button className="home-card" onClick={() => navigate("agenda")}>
          <span className="icon">📅</span>
          <span className="title">Agenda</span>
          <span className="desc">Ver pacientes del día e ingresar a ficha clínica</span>
        </button>

        <button className="home-card" onClick={() => navigate("informes")}>
          <span className="icon">📝</span>
          <span className="title">Informes</span>
          <span className="desc">Crear y revisar informes médicos</span>
        </button>

        <button className="home-card" onClick={() => navigate("pacientes")}>
          <span className="icon">👥</span>
          <span className="title">Pacientes</span>
          <span className="desc">Buscar pacientes no agendados y acceder a historial</span>
        </button>

        <button className="home-card" onClick={() => navigate("pagos")}>
          <span className="icon">💰</span>
          <span className="title">Pagos</span>
          <span className="desc">Resumen de pagos por día o mes</span>
        </button>

        <button className="home-card" onClick={() => navigate("configuracion")}>
          <span className="icon">⚙️</span>
          <span className="title">Configuración</span>
          <span className="desc">Perfil médico, firma y ajustes personales</span>
        </button>

      </section>
    </div>
  );
}
