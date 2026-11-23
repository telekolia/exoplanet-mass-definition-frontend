import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api, requestError } from '../api'
import { getFeedItem, getTelescopes } from '../modules/telescopesApi'
import { FULL_LATITUDE_RANGE, type LatitudeRange, type Telescope } from '../modules/telescope'
import type { RootState } from '../store'
import { sessionEnded, sessionStarted } from './sessionActions'

type ThunkConfig = { state: RootState; rejectValue: string }

export const getTelescopesList = createAsyncThunk<
  { items: Telescope[]; mock: boolean }, void, ThunkConfig
>('telescopes/list', async (_, { getState, signal, rejectWithValue }) => {
  const state = getState()
  try { return await getTelescopes(state.telescopes.appliedRange, state.user.token, signal) }
  catch (error) { return rejectWithValue(requestError(error)) }
})

export const getTelescopeFeed = createAsyncThunk<
  { item: Telescope | null; mock: boolean }, { id: number | null; next: boolean }, ThunkConfig
>('telescopes/feed', async ({ id, next }, { getState, signal, rejectWithValue }) => {
  try { return await getFeedItem(id, next, getState().user.token, signal) }
  catch (error) { return rejectWithValue(requestError(error)) }
})

export const deleteTelescope = createAsyncThunk<number, number, ThunkConfig>(
  'telescopes/delete', async (id, { getState, signal, rejectWithValue }) => {
    if (!getState().user.isAuthenticated) return rejectWithValue('Войдите в систему.')
    try {
      await api.telescopes.telescopesDelete(id, { signal })
      return id
    } catch (error) { return rejectWithValue(requestError(error)) }
  },
)

export const likeTelescope = createAsyncThunk<
  { id: number; is_liked: number; likes_count: number }, { id: number; like: 0 | 1 }, ThunkConfig
>('telescopes/like', async ({ id, like }, { getState, signal, rejectWithValue }) => {
  if (!getState().user.isAuthenticated) return rejectWithValue('Войдите в систему.')
  try {
    const { data } = await api.telescopes.likesCreate(id, { like }, { signal })
    return { id, is_liked: data.is_liked ?? like, likes_count: data.likes_count ?? 0 }
  } catch (error) { return rejectWithValue(requestError(error)) }
})

const initialState = {
  range: FULL_LATITUDE_RANGE,
  appliedRange: FULL_LATITUDE_RANGE,
  items: [] as Telescope[],
  feed: null as Telescope | null,
  listMock: false, feedMock: false,
  listLoading: false, feedLoading: false,
  listError: '', feedError: '', actionError: '',
  listRequest: '', feedRequest: '', mutationRequest: '',
}

const telescopesSlice = createSlice({
  name: 'telescopes', initialState,
  reducers: {
    setRange(state, { payload }: PayloadAction<LatitudeRange>) { state.range = payload },
    applyRange(state) { state.appliedRange = { ...state.range } },
    clearActionError(state) { state.actionError = '' },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionEnded, () => ({ ...initialState }))
      .addCase(sessionStarted, (state) => ({ ...initialState, range: state.range, appliedRange: state.appliedRange }))
      .addCase(getTelescopesList.pending, (state, action) => {
        state.listLoading = true; state.listError = ''; state.listRequest = action.meta.requestId
      })
      .addCase(getTelescopesList.fulfilled, (state, action) => {
        if (state.listRequest !== action.meta.requestId) return
        state.items = action.payload.items; state.listMock = action.payload.mock; state.listLoading = false
      })
      .addCase(getTelescopesList.rejected, (state, action) => {
        if (state.listRequest !== action.meta.requestId) return
        state.listLoading = false
        if (!action.meta.aborted) state.listError = action.payload ?? 'Не удалось загрузить каталог.'
      })
      .addCase(getTelescopeFeed.pending, (state, action) => {
        state.feedLoading = true; state.feedError = ''; state.feed = null; state.feedRequest = action.meta.requestId
      })
      .addCase(getTelescopeFeed.fulfilled, (state, action) => {
        if (state.feedRequest !== action.meta.requestId) return
        state.feed = action.payload.item; state.feedMock = action.payload.mock; state.feedLoading = false
      })
      .addCase(getTelescopeFeed.rejected, (state, action) => {
        if (state.feedRequest !== action.meta.requestId) return
        state.feedLoading = false
        if (!action.meta.aborted) state.feedError = action.payload ?? 'Не удалось загрузить ленту.'
      })
      .addCase(deleteTelescope.pending, (state, action) => {
        state.actionError = ''; state.mutationRequest = action.meta.requestId
      })
      .addCase(deleteTelescope.fulfilled, (state, action) => {
        if (state.mutationRequest !== action.meta.requestId) return
        state.items = state.items.filter((item) => item.id !== action.payload)
        if (state.feed?.id === action.payload) state.feed = null
      })
      .addCase(deleteTelescope.rejected, (state, action) => {
        if (state.mutationRequest === action.meta.requestId) state.actionError = action.payload ?? 'Не удалось удалить карточку.'
      })
      .addCase(likeTelescope.pending, (state, action) => {
        state.actionError = ''; state.mutationRequest = action.meta.requestId
      })
      .addCase(likeTelescope.fulfilled, (state, action) => {
        if (state.mutationRequest !== action.meta.requestId) return
        const item = state.items.find((item) => item.id === action.payload.id)
        if (item) item.likes_count = action.payload.likes_count
        if (state.feed?.id === action.payload.id) {
          state.feed.is_liked = action.payload.is_liked
          state.feed.likes_count = action.payload.likes_count
        }
      })
      .addCase(likeTelescope.rejected, (state, action) => {
        if (state.mutationRequest === action.meta.requestId) state.actionError = action.payload ?? 'Не удалось изменить лайк.'
      })
  },
})
export const { setRange, applyRange, clearActionError } = telescopesSlice.actions
export default telescopesSlice.reducer
