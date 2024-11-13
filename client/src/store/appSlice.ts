import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../api/baseApi";
import { AxiosError } from "axios";

const sliceName = "appSlice";

interface AuthData {
  login: string;
  role: string;
  token: string;
}

interface AppState {
  auth: AuthData | null;
  isRegisterPending: boolean;
}

const initialState: AppState = {
  auth: null,
  isRegisterPending: false,
};

export const registerAction = createAsyncThunk(
  `${sliceName}/registerAction`,
  async (data: { login: string; role: string }, thunkAPI) => {
    try {
      const result = await axiosInstance.post("/register", {
        data,
      });

      return result.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        return thunkAPI.rejectWithValue({
          status: e.status,
        });
      }

      throw e;
    }
  }
);

export const meAction = createAsyncThunk(
  `${sliceName}/meAction`,
  async (data: { token: string }, thunkAPI) => {
    try {
      const result = await axiosInstance.get("/me", {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      return result.data;
    } catch (e) {
      if (e instanceof AxiosError) {
        return thunkAPI.rejectWithValue({
          status: e.status,
        });
      }

      throw e;
    }
  }
);

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
  extraReducers: (builder) => {
    builder.addCase(registerAction.pending, (state) => {
      state.isRegisterPending = true;
    });
    builder.addCase(registerAction.fulfilled, (state) => {
      state.isRegisterPending = false;
    });
    builder.addCase(registerAction.rejected, (state) => {
      state.isRegisterPending = false;
    });
  },
});

export const appActions = appSlice.actions;
export const appReducer = appSlice.reducer;
