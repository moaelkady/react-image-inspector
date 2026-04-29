type EmptyStateProps = {
  message: string
  isError?: boolean
}

export function EmptyState({ message, isError = false }: EmptyStateProps) {
  return (
    <div className={isError ? 'rii__error' : 'rii__empty'} role="status" aria-live="polite">
      {message}
    </div>
  )
}
