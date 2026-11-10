import lcmImage from '../assets/114-lcm-comp-telescope.png'
import lcmVideo from '../assets/114-lcm-comp-telescope.mp4'
import nexstarImage from '../assets/nexstar-8se.png'
import type { Telescope } from './telescope'

export const TELESCOPES_MOCK: readonly Telescope[] = [
  {
    id: 1,
    title: 'Celestron 114 LCM',
    description: 'Телескоп с компьютерным наведением для наблюдений Луны, планет и ярких объектов глубокого космоса.',
    latitude: 55.75,
    longitude: 37.62,
    image_url: lcmImage,
    video_url: lcmVideo,
    likes_count: 12,
  },
  {
    id: 2,
    title: 'NexStar 8SE',
    description: 'Компактный телескоп системы Шмидта — Кассегрена с апертурой 203 мм и автоматическим наведением.',
    latitude: 43.12,
    longitude: 131.89,
    image_url: nexstarImage,
    video_url: '',
    likes_count: 8,
  },
  {
    id: 3,
    title: 'PowerSeeker 80AZS',
    description: 'Лёгкий рефрактор на азимутальной монтировке. Подходит для первых наблюдений Луны и ярких звёздных скоплений.',
    latitude: -33.45,
    longitude: -70.67,
    image_url: '',
    video_url: '',
    likes_count: 3,
  },
]
