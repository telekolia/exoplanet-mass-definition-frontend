import { createAction } from '@reduxjs/toolkit'
import type { UserSession } from '../modules/session'
export const sessionStarted = createAction<UserSession>('user/sessionStarted')
export const sessionEnded = createAction('user/sessionEnded')
