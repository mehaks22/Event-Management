import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
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

// Fetch Events Thunk
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://localhost:8080/api/events');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
    }
  }
);

// Create Event Thunk
export const createNewEvent = createAsyncThunk(
  'events/createNewEvent',
  async (
    { payload, organizerId }: { payload: CreateEventPayload; organizerId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      const fullBody = {
        title: payload.title,
        description: payload.description,
        eventDate: payload.eventDate,
        location: payload.location,
        category: payload.category,
        capacity: payload.capacity,
        organizerId: organizerId,
      };

      const response = await axios.post(
        'http://localhost:8080/api/events',
        fullBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Failed to create event'
      );
    }
  }
);

// Register for Event Thunk
export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/events/${eventId}/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      // Fetch Events
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

      // Create Event
      .addCase(createNewEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })

      // Register for Event
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      });
  },
});

// Both named export and default export provided to avoid import mismatch errors
export const eventReducer = eventSlice.reducer;
export default eventSlice.reducer;