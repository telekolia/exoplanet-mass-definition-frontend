export interface Telescope {
  id: number
  title: string
  description: string
  latitude: number
  longitude: number
  image_url: string
  video_url: string
  likes_count: number
}

export interface LatitudeRange {
  min: number
  max: number
}

export const FULL_LATITUDE_RANGE: LatitudeRange = { min: -90, max: 90 }
