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
        <button
          className="home-card"
          onClick={() => navigate("agenda")}
          aria-label="Agenda"
        >
          <span className="icon">📅</span>
          <span className="title">Agenda</span>
          <span className="desc">Ver agenda médica</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("pacientes")}
          aria-label="Pacientes"
        >
          <span className="icon">👥</span>
          <span className="title">Pacientes</span>
          <span className="desc">Listado y fichas</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("documentos")}
          aria-label="Documentos"
        >
          <span className="icon">📄</span>
          <span className="title">Documentos</span>
          <span className="desc">Órdenes y recetas</span>
        </button>
      </section>
    </div>
  );
}
