import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authStore';
import { eventReducer } from './eventStore';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;