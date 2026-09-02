import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';
import { CreateEventPayload } from '../types';

interface EventState {
  events: any[];
  loading: boolean;
  error: string | null;
}

const initialState: EventState = {
  events: [],
  loading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/events');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
    }
  }
);

export const createNewEvent = createAsyncThunk(
  'events/createNewEvent',
  async (
    { payload, organizerId }: { payload: CreateEventPayload; organizerId: string },
    { rejectWithValue }
  ) => {
    try {
      const fullBody = {
        title: payload.title,
        description: payload.description,
        eventDate: payload.eventDate,
        location: payload.location,
        category: payload.category,
        capacity: payload.capacity,
        organizerId: organizerId,
      };

      const response = await API.post('/events', fullBody);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to create event'
      );
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await API.post(`/events/${eventId}/register`, {});
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createNewEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      });
  },
});

export const eventReducer = eventSlice.reducer;
export default eventSlice.reducer;