import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { api, requestError } from '../api'
import { getDraft, telescopeData } from '../modules/telescopesApi'
import type { Telescope } from '../modules/telescope'
import type { RootState } from '../store'
import { sessionEnded, sessionStarted } from './sessionActions'
import { deleteTelescope } from './telescopesSlice'
import type { DsPublishTelescopeRequest } from '../api/Api'

type ThunkConfig = { state: RootState; rejectValue: string }

export const getTelescopeDraft = createAsyncThunk<Telescope | null, void, ThunkConfig>(
  'draft/get',
  async (_, { getState, signal, rejectWithValue }) => {
    if (!getState().user.isAuthenticated) return rejectWithValue('Войдите в систему.')
    try {
      return await getDraft(signal)
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

export interface CreateDraftData {
  title: string
  image?: File
  video?: File
}
export const createTelescopeDraft = createAsyncThunk<Telescope, CreateDraftData, ThunkConfig>(
  'draft/create',
  async (input, { getState, signal, rejectWithValue }) => {
    if (!getState().user.isAuthenticated) return rejectWithValue('Войдите в систему.')
    const data: CreateDraftData = { title: input.title.trim() }
    if (input.image) data.image = input.image
    if (input.video) data.video = input.video
    try {
      const response = await api.telescopes.telescopesCreate(data, { signal, timeout: 120000 })
      return telescopeData(response.data)
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

export const publishTelescopeDraft = createAsyncThunk<Telescope, void, ThunkConfig>(
  'draft/publish',
  async (_, { getState, signal, rejectWithValue }) => {
    const { draft, user } = getState()
    if (!user.isAuthenticated || !draft.item) return rejectWithValue('Черновик не найден.')
    const data: DsPublishTelescopeRequest = {
      description: draft.fields.description.trim(),
      latitude: Number(draft.fields.latitude),
      longitude: Number(draft.fields.longitude),
    }
    if (
      !data.description ||
      draft.fields.latitude === '' ||
      draft.fields.longitude === '' ||
      !Number.isFinite(data.latitude) ||
      Math.abs(data.latitude) > 90 ||
      !Number.isFinite(data.longitude) ||
      Math.abs(data.longitude) > 180
    ) {
      return rejectWithValue('Заполните описание и корректные координаты.')
    }
    try {
      const response = await api.telescopes.telescopesUpdate(draft.item.id, data, { signal })
      return telescopeData(response.data)
    } catch (error) {
      return rejectWithValue(requestError(error))
    }
  },
)

const emptyFields = { description: '', latitude: '', longitude: '' }
const initialState = {
  item: null as Telescope | null,
  title: '',
  fields: emptyFields,
  loading: false,
  loaded: false,
  error: '',
  requestId: '',
}
const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    setDraftTitle(state, { payload }: PayloadAction<string>) {
      state.title = payload
    },
    setDraftFields(state, { payload }: PayloadAction<Partial<typeof emptyFields>>) {
      Object.assign(state.fields, payload)
    },
    setDraftError(state, { payload }: PayloadAction<string>) {
      state.error = payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionEnded, () => ({ ...initialState }))
      .addCase(sessionStarted, () => ({ ...initialState }))
      .addCase(deleteTelescope.fulfilled, (state, action) => {
        if (state.item?.id === action.payload) return { ...initialState, loaded: true }
      })
      .addCase(publishTelescopeDraft.fulfilled, (state, action) => {
        if (state.requestId === action.meta.requestId) return { ...initialState, loaded: true }
      })
      .addCase(getTelescopeDraft.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        const sameDraft = state.item?.id === action.payload?.id
        state.item = action.payload
        state.loaded = true
        state.loading = false
        if (action.payload) {
          state.title = action.payload.title
          if (!sameDraft)
            state.fields = {
              description: action.payload.description,
              latitude: String(action.payload.latitude),
              longitude: String(action.payload.longitude),
            }
        }
      })
      .addCase(createTelescopeDraft.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return
        state.item = action.payload
        state.title = action.payload.title
        state.fields = { ...emptyFields }
        state.loaded = true
        state.loading = false
      })
      .addMatcher(
        (action): action is ReturnType<typeof getTelescopeDraft.pending> =>
          [
            getTelescopeDraft.pending.type,
            createTelescopeDraft.pending.type,
            publishTelescopeDraft.pending.type,
          ].includes(action.type),
        (state, action) => {
          state.loading = true
          state.error = ''
          state.requestId = action.meta.requestId
        },
      )
      .addMatcher(
        (action): action is ReturnType<typeof getTelescopeDraft.rejected> =>
          [
            getTelescopeDraft.rejected.type,
            createTelescopeDraft.rejected.type,
            publishTelescopeDraft.rejected.type,
          ].includes(action.type),
        (state, action) => {
          if (state.requestId !== action.meta.requestId) return
          state.loading = false
          if (!action.meta.aborted) state.error = action.payload ?? 'Не удалось выполнить запрос.'
        },
      )
  },
})
export const { setDraftTitle, setDraftFields, setDraftError } = draftSlice.actions
export default draftSlice.reducer
