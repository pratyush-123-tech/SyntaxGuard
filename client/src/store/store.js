import { configureStore } from '@reduxjs/toolkit';
import analysisReducer from './analysisSlice';
import authReducer from './authSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    analysis: analysisReducer,
    auth: authReducer,
    notifications: notificationReducer,
  },
});
