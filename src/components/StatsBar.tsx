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
  // One number gets to be big: the best streak is the hero, the rest sit
  // quiet beside it. Same values, same props — presentation only.
  const stats = [
    { label: "Done today", value: `${doneToday} / ${totalHabits}` },
    { label: "This week", value: `${weeklyRate}%` },
    { label: "Last 30 days", value: `${completionRate30d}%` },
    { label: "Total check-ins", value: String(totalCheckIns) },
    { label: "Active habits", value: String(totalHabits) },
  ];
  return (
    <section className="stats-bar" aria-label="Overall statistics">
      <div className="stat stat-hero">
        <span className="stat-value">{bestStreak}</span>
        <span className="stat-label">Best streak · days</span>
      </div>
      {stats.map((s) => (
        <div className="stat" key={s.label}>
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </section>
  );
}
