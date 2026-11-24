import { configureStore } from '@reduxjs/toolkit'
import user from './slices/userSlice'
import telescopes from './slices/telescopesSlice'
import draft from './slices/draftSlice'
import ui from './slices/uiSlice'
import { setUnauthorizedHandler } from './api'
import { saveSession } from './modules/session'
import { sessionEnded } from './slices/sessionActions'

export const store = configureStore({ reducer: { user, telescopes, draft, ui } })
setUnauthorizedHandler(() => {
  saveSession(null)
  store.dispatch(sessionEnded())
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const selectBusy = (state: RootState) =>
  state.user.loading || Object.keys(state.ui.requests).length > 0
