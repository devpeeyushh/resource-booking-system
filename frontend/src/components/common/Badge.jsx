const TONES = {
  accent: 'bg-accent-soft text-accent-ink',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-black/5 text-ink-muted',
}

export default function Badge({ children, tone = 'neutral' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}
