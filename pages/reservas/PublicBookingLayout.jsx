// pages/reservas/PublicBookingLayout.jsx
import { useEffect, useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --pb-navy:      #07111f;
    --pb-blue:      #1d4ed8;
    --pb-blue-lt:   #3b82f6;
    --pb-cream:     #f8f6f1;
    --pb-warm:      #e8e4da;
    --pb-text:      #1e293b;
    --pb-muted:     #64748b;
    --pb-border:    rgba(255,255,255,0.12);
    --pb-serif:     'Instrument Serif', Georgia, serif;
    --pb-sans:      'DM Sans', sans-serif;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .pb-root {
    min-height: 100vh;
    background: var(--pb-cream);
    font-family: var(--pb-sans);
    color: var(--pb-text);
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }

  /* ── HEADER ── */
  .pb-header {
    background: var(--pb-navy);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .pb-header-inner {
    max-width: 1020px;
    margin: 0 auto;
    padding: 0 20px;
    height: 62px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }

  /* Back button */
  .pb-back {
    justify-self: start;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: transparent;
    border: 1px solid var(--pb-border);
    color: rgba(255,255,255,0.65);
    font-family: var(--pb-sans);
    font-size: 13px;
    font-weight: 500;
    padding: 7px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.18s ease;
    letter-spacing: 0.01em;
  }
  .pb-back:hover {
    border-color: rgba(255,255,255,0.35);
    color: #fff;
    background: rgba(255,255,255,0.06);
  }

  /* Brand center */
  .pb-brand {
    justify-self: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }
  .pb-brand-name {
    font-family: var(--pb-serif);
    font-size: 15px;
    color: #ffffff;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .pb-brand-sub {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
  }

  /* Home button */
  .pb-home-btn {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 34px;
    padding: 0 16px;
    border-radius: 999px;
    font-family: var(--pb-sans);
    font-weight: 600;
    font-size: 13px;
    text-decoration: none;
    color: #ffffff;
    background: var(--pb-blue);
    transition: all 0.18s ease;
    letter-spacing: 0.01em;
  }
  .pb-home-btn:hover {
    background: var(--pb-blue-lt);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(29, 78, 216, 0.45);
  }

  /* ── HERO BAND ── */
  .pb-hero {
    background: var(--pb-navy);
    padding: 40px 20px 48px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .pb-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 80% at 20% 50%, rgba(29,78,216,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 40%, rgba(59,130,246,0.1) 0%, transparent 70%);
    pointer-events: none;
  }
  .pb-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--pb-blue-lt);
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.22);
    border-radius: 999px;
    padding: 5px 14px;
    margin-bottom: 18px;
  }
  .pb-hero-eyebrow-dot {
    width: 6px;
    height: 6px;
    background: var(--pb-blue-lt);
    border-radius: 50%;
    animation: pb-blink 2s ease-in-out infinite;
  }
  @keyframes pb-blink {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.3; }
  }
  .pb-hero-title {
    font-family: var(--pb-serif);
    font-size: clamp(26px, 4vw, 38px);
    color: #ffffff;
    line-height: 1.2;
    letter-spacing: -0.01em;
    margin-bottom: 10px;
  }
  .pb-hero-title em {
    font-style: italic;
    color: rgba(255,255,255,0.55);
  }
  .pb-hero-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.45);
    font-weight: 400;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* Trust bar */
  .pb-trust {
    background: var(--pb-navy);
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 14px 20px;
  }
  .pb-trust-inner {
    max-width: 1020px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    flex-wrap: wrap;
  }
  .pb-trust-item {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    font-weight: 500;
  }
  .pb-trust-icon {
    width: 16px;
    height: 16px;
    color: var(--pb-blue-lt);
    flex-shrink: 0;
  }

  /* ── MAIN ── */
  .pb-main {
    flex: 1;
    padding: 32px 16px 48px;
    display: flex;
    justify-content: center;
  }
  .pb-content {
    width: 100%;
    max-width: 1020px;
  }

  /* ── FOOTER ── */
  .pb-footer {
    background: var(--pb-navy);
    padding: 28px 20px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .pb-footer-inner {
    max-width: 1020px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .pb-footer-brand {
    font-family: var(--pb-serif);
    font-size: 14px;
    color: rgba(255,255,255,0.5);
  }
  .pb-footer-links {
    display: flex;
    gap: 20px;
  }
  .pb-footer-link {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    text-decoration: none;
    transition: color 0.15s;
  }
  .pb-footer-link:hover { color: rgba(255,255,255,0.65); }
  .pb-footer-copy {
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    width: 100%;
    text-align: center;
    margin-top: 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    padding-top: 16px;
  }

  /* ── FADE-IN ── */
  .pb-fade-in {
    animation: pb-fade 0.5s ease both;
  }
  @keyframes pb-fade {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 600px) {
    .pb-header-inner { padding: 0 14px; height: 56px; }
    .pb-back span { display: none; }
    .pb-brand-name { font-size: 13px; }
    .pb-trust-item:nth-child(n+3) { display: none; }
    .pb-footer-links { display: none; }
    .pb-footer-inner { justify-content: center; }
  }
`;

export default function PublicLayout({ children }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goBack = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/";
  };

  return (
    <div className="pb-root">

      {/* ── HEADER ── */}
      <header className="pb-header" style={{ boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.3)" : "none", transition: "box-shadow 0.3s" }}>
        <div className="pb-header-inner">

          <button className="pb-back" onClick={goBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span>Volver</span>
          </button>

          <div className="pb-brand">
            <span className="pb-brand-name">Instituto de Cirugía Articular</span>
            <span className="pb-brand-sub">Curicó · Chile</span>
          </div>

          <a href="/" className="pb-home-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Inicio
          </a>

        </div>
      </header>

      {/* ── HERO BAND ── */}
      <section className="pb-hero pb-fade-in">
        <div className="pb-hero-eyebrow">
          <span className="pb-hero-eyebrow-dot"/>
          Reserva en línea
        </div>
        <h1 className="pb-hero-title">
          Agenda tu hora <em>fácil y rápido</em>
        </h1>
        <p className="pb-hero-sub">
          Elige especialidad, profesional y horario disponible en pocos pasos.
        </p>
      </section>

      {/* ── TRUST BAR ── */}
      <div className="pb-trust">
        <div className="pb-trust-inner">
          <div className="pb-trust-item">
            <svg className="pb-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Reserva segura
          </div>
          <div className="pb-trust-item">
            <svg className="pb-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Confirmación inmediata
          </div>
          <div className="pb-trust-item">
            <svg className="pb-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.35 5.35l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Sin llamadas
          </div>
          <div className="pb-trust-item">
            <svg className="pb-trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Horarios en tiempo real
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main className="pb-main">
        <div className="pb-content pb-fade-in" style={{ animationDelay: "0.1s" }}>
          {children}
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="pb-footer">
        <div className="pb-footer-inner">
          <span className="pb-footer-brand">Instituto de Cirugía Articular</span>
          <div className="pb-footer-links">
            <a href="tel:+56712345678" className="pb-footer-link">Teléfono</a>
            <a href="mailto:contacto@ica.cl" className="pb-footer-link">Contacto</a>
            <a href="/privacidad" className="pb-footer-link">Privacidad</a>
          </div>
        </div>
        <div className="pb-footer-inner">
          <p className="pb-footer-copy">
            © {new Date().getFullYear()} Instituto de Cirugía Articular · Curicó, Chile
          </p>
        </div>
      </footer>

    </div>
  );
}
