import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    userData: { fullName: string; email: string; phoneNumber: string; password: string; role: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', userData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Registration failed on server'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.response?.data || 'Login failed on server'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        const data = action.payload || {};
        const u = data.user || data; // handles nested or flat response

        localStorage.setItem('userId', u.id || u.userId || '');
        localStorage.setItem('userName', u.fullName || u.name || u.username || 'User');
        localStorage.setItem('userRole', (u.role || 'USER').toUpperCase());
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;

        console.log("FULL LOGIN RESPONSE FROM BACKEND:", action.payload);

                const data = action.payload || {};
                const u = data.user || data;

                const token = data.token || data.accessToken || data.jwt;
                if (token) {
                  localStorage.setItem('token', token);
                }

                localStorage.setItem('userId', u.id || u.userId || '');
                localStorage.setItem('userName', u.fullName || u.name || u.username || 'User');
                localStorage.setItem('userRole', (u.role || 'USER').toUpperCase());
              })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authSlice.reducer;