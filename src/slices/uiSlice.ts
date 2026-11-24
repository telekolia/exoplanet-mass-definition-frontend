import { createSlice, isAnyOf, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit'
const uiSlice = createSlice({
  name: 'ui',
  initialState: { requests: {} as Record<string, true> },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addMatcher(isPending, (state, action) => {
        state.requests[action.meta.requestId] = true
      })
      .addMatcher(isAnyOf(isFulfilled, isRejected), (state, action) => {
        delete state.requests[action.meta.requestId]
      })
  },
})
export default uiSlice.reducer
