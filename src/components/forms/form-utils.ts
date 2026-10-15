import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

/** Push server-side field errors (i18n keys) into React Hook Form. */
export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: Record<string, string> | undefined,
) {
  if (!fieldErrors) return
  for (const [name, message] of Object.entries(fieldErrors)) {
    setError(name as Path<T>, { type: 'server', message })
  }
}
