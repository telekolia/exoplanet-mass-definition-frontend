import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getSession } from '../modules/session'
import { sessionEnded, sessionStarted } from './sessionActions'

const initialSession = getSession()
const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: initialSession?.token ?? '',
    username: initialSession?.username ?? '',
    expiresAt: initialSession?.expiresAt ?? 0,
    isAuthenticated: Boolean(initialSession), loading: false, error: '',
  },
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
      if (action.payload) state.error = ''
    },
    setAuthError(state, action: PayloadAction<string>) { state.error = action.payload },
  },
  extraReducers: (builder) => {
    builder.addCase(sessionStarted, (state, { payload }) => {
      Object.assign(state, payload)
      state.isAuthenticated = true
      state.error = ''
    }).addCase(sessionEnded, (state) => {
      state.token = ''; state.username = ''; state.expiresAt = 0
      state.isAuthenticated = false; state.error = ''
    })
  },
})
export const { setAuthLoading, setAuthError } = userSlice.actions
export default userSlice.reducer
