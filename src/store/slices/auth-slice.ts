import { createSlice } from '@reduxjs/toolkit'
import { doLogin } from './auth-thunk';

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  token: string | undefined
}

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  token: undefined
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isAuthenticated = false
      state.token = undefined
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(doLogin.pending, (state) => {
      state.isLoading = true
    }).addCase(doLogin.fulfilled, (state, action) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.isLoading = false
    }).addCase(doLogin.rejected, (state) => {
      state.isAuthenticated = false
      state.token = undefined
      state.isLoading = false
    })
  }
});

export const { reset } = authSlice.actions
export const authReducer = authSlice.reducer