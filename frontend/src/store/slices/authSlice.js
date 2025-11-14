import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import userClient from '../../api/userClient';

function loadSavedAuth(){
  try{
    const raw = localStorage.getItem('kama_auth')
    if(!raw) return { user: null, token: null }
    const parsed = JSON.parse(raw)
    return { user: parsed.user || null, token: parsed.token || null }
  }catch(e){
    console.error('Error loading saved auth:', e)
    return { user: null, token: null }
  }
}

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userClient.updateProfile(userData);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userClient.getProfile();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }
);

const saved = loadSavedAuth()

const initialState = {
  user: saved.user,
  token: saved.token,
  status: 'idle'
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action){
      state.user = action.payload
      const raw = localStorage.getItem('kama_auth')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.user = action.payload
      localStorage.setItem('kama_auth', JSON.stringify(parsed))
    },
    setToken(state, action){
      state.token = action.payload
      const raw = localStorage.getItem('kama_auth')
      const parsed = raw ? JSON.parse(raw) : {}
      parsed.token = action.payload
      localStorage.setItem('kama_auth', JSON.stringify(parsed))
    },
    clearAuth(state){
      state.user = null
      state.token = null
      localStorage.removeItem('kama_auth')
    },
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('kama_auth')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        // Update user in state
        state.user = { ...state.user, ...action.payload.user };
        // Update user in localStorage
        const raw = localStorage.getItem('kama_auth');
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.user = { ...parsed.user, ...action.payload.user };
        localStorage.setItem('kama_auth', JSON.stringify(parsed));
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // Update user in state
        state.user = action.payload;
        // Update user in localStorage
        const raw = localStorage.getItem('kama_auth');
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.user = action.payload;
        localStorage.setItem('kama_auth', JSON.stringify(parsed));
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        // Handle error - clear auth if profile fetch fails
        console.error('Failed to fetch user profile:', action.payload);
        state.user = null;
        state.token = null;
        localStorage.removeItem('kama_auth');
      });
  }
})

export const { setUser, setToken, clearAuth, logout } = authSlice.actions
export default authSlice.reducer