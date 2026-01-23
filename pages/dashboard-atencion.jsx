import "../styles/atencion/dashboard-atencion.css";

export default function DashboardAtencion() {
  return (
    <div className="dashboard dashboard-atencion">
      <header className="dashboard-header">
        <h1>Atención Clínica</h1>
      </header>

      <main className="dashboard-body atencion-layout">
        <section className="panel">
          <div className="panel-header">Atención</div>
          <div className="panel-body">{/* Texto atención */}</div>
        </section>

        <section className="panel">
          <div className="panel-header">Receta</div>
          <div className="panel-body">{/* Receta */}</div>
        </section>

        <section className="panel">
          <div className="panel-header">Exámenes</div>
          <div className="panel-body">{/* Exámenes */}</div>
        </section>
      </main>
    </div>
  );
}
