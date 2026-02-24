export default function PublicLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#0f172a",
          color: "white",
          padding: "32px 20px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "0.5px"
          }}
        >
          Instituto de Cirugía Articular
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "14px",
            opacity: 0.85
          }}
        >
          Reserva tu hora médica online
        </p>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main
        style={{
          flex: 1,
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            background: "white",
            borderRadius: "18px",
            padding: "40px",
            boxShadow: "0 25px 60px rgba(15,23,42,0.08)"
          }}
        >
          {children}
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          background: "#ffffff",
          padding: "18px",
          textAlign: "center",
          fontSize: "13px",
          color: "#64748b",
          borderTop: "1px solid #e2e8f0"
        }}
      >
        © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó
      </footer>
    </div>
  );
}
