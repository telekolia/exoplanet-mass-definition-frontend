import axios from 'axios'
import { Api } from './Api'
import { getSession } from '../modules/session'

export const api = new Api<string>({ baseURL: '/api', timeout: 20000 })
export const authApi = axios.create({ baseURL: '/api', timeout: 20000 })
let onUnauthorized = () => {}
export function setUnauthorizedHandler(handler: () => void) { onUnauthorized = handler }

api.instance.interceptors.request.use((config) => {
  const token = getSession()?.token
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
api.instance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      if (getSession()?.token && error.config?.headers?.Authorization === `Bearer ${getSession()?.token}`) onUnauthorized()
    }
    return Promise.reject(error)
  },
)
export function requestError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 400: return 'Проверьте заполненные поля.'
      case 401: return 'Неверный логин или пароль либо срок входа истёк.'
      case 403: return 'Это действие недоступно для данной карточки.'
      case 404: return 'Карточка не найдена.'
      case 409: return 'Черновик уже существует или карточка уже опубликована.'
      case 413: return 'Слишком большой файл: изображение до 5 МиБ, видео до 50 МиБ.'
      case 415: return 'Неподдерживаемый формат запроса.'
      default: return 'Сервис недоступен. Попробуйте ещё раз.'
    }
  }
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос.'
}
