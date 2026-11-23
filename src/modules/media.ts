export function mediaURL(value: string): string {
  if (!value || !/^https?:\/\//.test(value)) return value
  const url = new URL(value)
  const target = new URL(import.meta.env.VITE_S3_TARGET || 'http://localhost:9000')
  const sameHost = url.hostname === target.hostname ||
    (['localhost', '127.0.0.1'].includes(url.hostname) && ['localhost', '127.0.0.1'].includes(target.hostname))
  if (sameHost && url.port === target.port && url.protocol === target.protocol) return `/s3${url.pathname}${url.search}`
  return value
}
