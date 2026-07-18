import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('accessToken');
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user,
    accessToken: token,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setAuthLoading: (state, action) => { state.isLoading = action.payload; },
    setAuthError: (state, action) => { state.error = action.payload; state.isLoading = false; },
  },
});

export const { loginSuccess, logout, setAuthLoading, setAuthError } = authSlice.actions;
export default authSlice.reducer;
