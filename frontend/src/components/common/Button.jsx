const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-hover disabled:bg-accent/50',
  danger: 'bg-danger text-white hover:bg-danger-hover disabled:bg-danger/50',
  ghost: 'bg-transparent text-ink hover:bg-black/5 border border-border',
  soft: 'bg-accent-soft text-accent-ink hover:bg-accent-soft/70',
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
