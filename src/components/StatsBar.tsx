interface StatsBarProps {
  totalHabits: number;
  doneToday: number;
  totalCheckIns: number;
  bestStreak: number;
  completionRate30d: number;
  weeklyRate: number;
}

export function StatsBar({
  totalHabits,
  doneToday,
  totalCheckIns,
  bestStreak,
  completionRate30d,
  weeklyRate,
}: StatsBarProps) {
  const stats = [
    { label: "Active habits", value: String(totalHabits) },
    { label: "Done today", value: `${doneToday} / ${totalHabits}` },
    { label: "Total check-ins", value: String(totalCheckIns) },
    { label: "Best streak", value: `${bestStreak} days` },
    { label: "Last 30 days", value: `${completionRate30d}%` },
    { label: "This week", value: `${weeklyRate}%` },
  ];
  return (
    <section className="stats-bar" aria-label="Overall statistics">
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
