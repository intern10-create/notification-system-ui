import { createSlice, PayloadInterface } from "@reduxjs/toolkit";

interface User {
  user_id: string;
  email: string;
  client_id: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  clientId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  role: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  clientId: null,
  isAuthenticated: false,
  loading: true,
  role: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadInterface<{
        token: string;
        clientId: string;
        user: User;
        isAuthenticated: boolean;
        loading: boolean;
        role: string;
      }>
    ) => {
      state.token = action.payload.token;
      state.clientId = action.payload.clientId;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.role = action.payload.role;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.clientId = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadInterface<boolean>) => {
      state.loading = action.payload;
    },
    initializeAuth: (
      state,
      action: PayloadInterface<{ token: string; clientId: string; user: User }>
    ) => {
      state.token = action.payload.token;
      state.clientId = action.payload.clientId;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.role = action.payload.role || "";
    },
  },
});

export const { loginSuccess, logout, setLoading, initializeAuth } =
  authSlice.actions;
export default authSlice.reducer;
