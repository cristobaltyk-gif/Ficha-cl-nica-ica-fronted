export default function AgendaSummary({
  professionals = [],
  mode = "monthly",
  startDate,
  onSelectDay
}) {
  const [daysByProfessional, setDaysByProfessional] = useState({});
  const [loading, setLoading] = useState(false);

  const baseDate = startDate || new Date().toISOString().slice(0, 10);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setLoading(true);
      const result = {};

      const endpoint =
        mode === "weekly"
          ? "/agenda/summary/week"
          : "/agenda/summary/month";

      for (const { id } of professionals) {
        const res = await fetch(
          `${API_URL}${endpoint}?professional=${id}&start_date=${baseDate}`
        );
        if (!res.ok) continue;

        const data = await res.json();
        result[id] = data.days || {};
      }

      if (!cancelled) {
        setDaysByProfessional(result);
        setLoading(false);
      }
    }

    loadSummary();
    return () => (cancelled = true);
  }, [professionals, mode, baseDate]);

  if (loading) return <p>Cargando agenda…</p>;

  return (
    <>
      {professionals.map((p) => {
        const days = daysByProfessional[p.id];
        if (!days) return null;

        return (
          <div key={p.id} className="month-calendar">
            <h4>{p.name}</h4>

            <div className="month-grid">
              {Object.entries(days).map(([date, status]) => (
                <button
                  key={date}
                  className={`day-cell ${status}`}
                  disabled={status === "empty"}
                  onClick={() =>
                    status !== "empty" &&
                    onSelectDay({ professional: p.id, date })
                  }
                >
                  {date.slice(-2)}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}
