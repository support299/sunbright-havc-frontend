export default function StatCard({ title, value, tone = "default" }) {
  const toneClasses = {
    default: "text-[var(--text-primary)]",
    green: "text-[var(--green)]",
    blue: "text-[var(--blue)]",
    red: "text-[var(--red)]",
    accent: "text-[var(--accent)]",
  }

  return (
    <div className="card p-5">
      <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
      <p className={`mt-2 text-3xl font-bold font-['Outfit'] ${toneClasses[tone]}`}>{value}</p>
    </div>
  )
}
