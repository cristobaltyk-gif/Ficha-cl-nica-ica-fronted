import { useEffect, useState } from "react";
import Agenda from "../components/agenda/Agenda";

const API_URL = import.meta.env.VITE_API_URL;

/*
Orquestador de Agenda
- NO define sistema
- NO define roles
- NO define UI de acciones
- SOLO arma contexto para Agenda
*/

export default function AgendaPage({ user }) {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [error, setError] = useState(null);

  // user = { usuario, role }
  // role se usa después para habilitar acciones, NO para estructura

  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      setLoading(true);
      setError(null);

      try {
        // 👉 contrato FINAL (aunque hoy no exista el endpoint)
        const res = await fetch(
          `${API_URL}/agenda?date=${new Date().toISOString().slice(0, 10)}`,
          { headers: { Accept: "application/json" } }
        );

        if (!res.ok) {
          throw new Error("No se pudo cargar agenda");
        }

        const data = await res.json();

        if (!cancelled) {
          setContext(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setContext(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAgenda();

    return () => {
      cancelled = true;
    };
  }, []);

  // ===== estados reales =====

  if (error) {
    return <div className="agenda-state">Error: {error}</div>;
  }

  return (
    <Agenda
      loading={loading}
      context={context}
    />
  );
}
