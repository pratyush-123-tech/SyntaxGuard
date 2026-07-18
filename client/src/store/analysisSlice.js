import { createSlice } from '@reduxjs/toolkit';

const analysisSlice = createSlice({
  name: 'analysis',
  initialState: {
    current: null,       // The active analysis result
    history: [],         // Past analyses list
    isLoading: false,    // True while AI is running
    isStreaming: false,  // True while SSE stream is active
    streamBuffer: '',    // Accumulates streaming text for display
    error: null,
    servedFromCache: false,
  },
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setStreaming: (state, action) => { state.isStreaming = action.payload; },
    appendStreamChunk: (state, action) => { state.streamBuffer += action.payload; },
    clearStreamBuffer: (state) => { state.streamBuffer = ''; },
    setAnalysisResult: (state, action) => {
      state.current = action.payload;
      state.isLoading = false;
      state.isStreaming = false;
      state.servedFromCache = action.payload?.servedFromCache || false;
    },
    setHistory: (state, action) => { state.history = action.payload; },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isStreaming = false;
    },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setStreaming, appendStreamChunk, clearStreamBuffer,
  setAnalysisResult, setHistory, setError, clearError,
} = analysisSlice.actions;

export default analysisSlice.reducer;
