import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const sliceName = "appSlice";

interface AuthData {
  login: string;
  role: "admin" | "user";
  token: string;
}

interface AppState {
  auth: AuthData | null;
}

const initialState: AppState = {
  auth: null,
};

const appSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<AuthData>) => {
      state.auth = action.payload;
    },
    clearAuth: (state) => {
      state.auth = null;
    },
  },
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
