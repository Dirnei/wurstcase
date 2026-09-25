/** Formats a duration as h:mm:ss, dropping fractional seconds. */
export function formatDuration(seconds: number): string {
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  return `${hours}:${pad(minutes)}:${pad(secs)}`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}
