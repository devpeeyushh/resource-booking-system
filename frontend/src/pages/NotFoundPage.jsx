import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-sm text-ink-faint">404</p>
      <h1 className="mt-2 font-display text-xl font-semibold text-ink">Page not found</h1>
      <Link to="/" className="mt-4 text-sm font-medium text-accent-ink underline">
        Back to Dashboard
      </Link>
    </div>
  )
}
