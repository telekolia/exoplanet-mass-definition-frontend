import axios from 'axios'
import { api } from '../api'
import type { DsFullTelescopeSerializer, DsTelescopeSerializer } from '../api/Api'
import { TELESCOPES_MOCK } from './mock'
import { mediaURL } from './media'
import type { LatitudeRange, Telescope } from './telescope'

export function telescopeData(item: DsFullTelescopeSerializer): Telescope {
  if (!item.id) throw new Error('Сервис вернул карточку без ID.')
  return {
    id: item.id,
    title: item.title ?? '',
    description: item.description ?? '',
    latitude: item.latitude ?? 0,
    longitude: item.longitude ?? 0,
    image_url: mediaURL(item.image_url ?? ''),
    video_url: mediaURL(item.video_url ?? ''),
    likes_count: item.likes_count ?? 0,
    is_creator: item.is_creator ?? false,
    is_liked: item.is_liked ?? 0,
    status: item.status,
  }
}

function guestFallback(error: unknown, token: string, signal: AbortSignal) {
  return (
    !token &&
    !signal.aborted &&
    axios.isAxiosError(error) &&
    (!error.response || error.response.status >= 500) &&
    !axios.isCancel(error)
  )
}

export async function getTelescopes(range: LatitudeRange, token: string, signal: AbortSignal) {
  try {
    const { data } = await api.telescopes.telescopesList(range, { signal })
    return { items: data.map(telescopeData), mock: false }
  } catch (error) {
    if (!guestFallback(error, token, signal)) throw error
    return {
      items: TELESCOPES_MOCK.filter(
        ({ latitude }) => latitude >= range.min && latitude <= range.max,
      ).map((item) => ({ ...item, is_creator: false, is_liked: 0 })),
      mock: true,
    }
  }
}

export async function getFeedItem(
  id: number | null,
  next: boolean,
  token: string,
  signal: AbortSignal,
) {
  try {
    const { data } = await api.telescopes.feedList(id === null ? {} : { id, next }, { signal })
    return { item: telescopeData(data), mock: false }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404)
      return { item: null, mock: false }
    if (!guestFallback(error, token, signal)) throw error
    const index = id === null ? 0 : TELESCOPES_MOCK.findIndex((item) => item.id === id)
    const item =
      index < 0 ? null : TELESCOPES_MOCK[next ? (index + 1) % TELESCOPES_MOCK.length : index]
    return { item: item ? { ...item, is_creator: false, is_liked: 0 } : null, mock: true }
  }
}

export async function getDraft(signal: AbortSignal) {
  const response = await api.telescopes.draftList({ signal })
  const data = response.data as DsTelescopeSerializer | null
  return data ? telescopeData(data) : null
}
