import { useNavigate } from "react-router-dom";
import "../../styles/home/home-secretaria.css";

export default function HomeSecretaria() {
  const navigate = useNavigate();

  return (
    <div className="home-secretaria">
      <header className="home-header">
        <h1>Secretaría</h1>
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
          <span className="desc">Gestión de horas</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("pacientes")}
          aria-label="Pacientes"
        >
          <span className="icon">👥</span>
          <span className="title">Pacientes</span>
          <span className="desc">Registro y búsqueda</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("medicos")}
          aria-label="Médicos"
        >
          <span className="icon">🩺</span>
          <span className="title">Médicos</span>
          <span className="desc">Profesionales</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("caja")}
          aria-label="Caja"
        >
          <span className="icon">💰</span>
          <span className="title">Caja</span>
          <span className="desc">Resumen de pagos</span>
        </button>

        <button
          className="home-card"
          onClick={() => navigate("administracion")}
          aria-label="Administración"
        >
          <span className="icon">⚙️</span>
          <span className="title">Administración</span>
          <span className="desc">Configuración</span>
        </button>
      </section>
    </div>
  );
}
