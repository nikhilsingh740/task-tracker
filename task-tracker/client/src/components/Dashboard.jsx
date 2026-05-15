export default function Dashboard({ stats, loading }) {
  const cards = [
    { label: "Total Tasks",  value: stats?.total     ?? "—", cls: "amber" },
    { label: "Pending",      value: stats?.pending   ?? "—", cls: "gray"  },
    { label: "In Progress",  value: stats?.inProgress ?? "—", cls: "blue"  },
    { label: "Completed",    value: stats?.completed ?? "—", cls: "green" },
    { label: "Overdue",      value: stats?.overdue   ?? "—", cls: "red"   },
  ];

  return (
    <section>
      <div style={{ marginBottom: "0.75rem" }}>
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--text-muted)",
          }}
        >
          Overview
        </h2>
      </div>
      <div className="stats-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat-card ${c.cls}`}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">
              {loading ? (
                <span style={{ fontSize: "1.5rem", color: "var(--text-muted)" }}>…</span>
              ) : (
                c.value
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
