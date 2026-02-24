export default function PublicBookingLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f4f6f9",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#ffffff",
          padding: "24px",
          borderBottom: "1px solid #e5e7eb",
          textAlign: "center"
        }}
      >
        <h1 style={{ margin: 0, fontSize: "22px" }}>
          Instituto de Cirugía Articular
        </h1>
        <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
          Reserva tu hora médica online
        </p>
      </header>

      {/* HERO */}
      <div
        style={{
          width: "100%",
          height: "240px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "20px",
          fontWeight: "600"
        }}
      >
        Atención Traumatológica Especializada
      </div>

      {/* CONTENIDO */}
      <main
        style={{
          flex: 1,
          padding: "40px 24px",
          maxWidth: "1100px",
          width: "100%",
          margin: "0 auto"
        }}
      >
        {children}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: "#ffffff",
          padding: "20px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
          fontSize: "14px",
          color: "#6b7280"
        }}
      >
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó
      </footer>
    </div>
  );
}
