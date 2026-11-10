import { TELESCOPES_MOCK } from './mock'
import type { LatitudeRange, Telescope } from './telescope'

const useBackend = import.meta.env.VITE_DATA_SOURCE === 'api'

async function getJSON<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal })
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные (HTTP ${response.status}).`)
  }
  return response.json() as Promise<T>
}

export async function getTelescopes(range: LatitudeRange, signal: AbortSignal): Promise<Telescope[]> {
  if (!useBackend) {
    return TELESCOPES_MOCK.filter(({ latitude }) => latitude >= range.min && latitude <= range.max)
  }

  const params = new URLSearchParams({ min: String(range.min), max: String(range.max) })
  return getJSON<Telescope[]>(`/api/telescopes?${params}`, signal)
}

export async function getFeedItem(id: number | null, next: boolean, signal: AbortSignal): Promise<Telescope | null> {
  if (!useBackend) {
    if (id === null) return TELESCOPES_MOCK[0] ?? null
    const index = TELESCOPES_MOCK.findIndex((item) => item.id === id)
    if (index === -1) return null
    return TELESCOPES_MOCK[next ? (index + 1) % TELESCOPES_MOCK.length : index] ?? null
  }

  const params = new URLSearchParams()
  if (id !== null) params.set('id', String(id))
  if (id !== null && next) params.set('next', 'true')
  const response = await fetch(`/api/telescopes/feed${params.size ? `?${params}` : ''}`, { signal })
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ленту (HTTP ${response.status}).`)
  }
  return response.json() as Promise<Telescope>
}
