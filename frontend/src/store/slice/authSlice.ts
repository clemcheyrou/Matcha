import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "registration failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "error");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        console.log("connected", data.message);
      } else {
        console.error("not connected", data.message);
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message || "error");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (
    userData: { firstname: string; lastname: string; username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "registration failed");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("profile update failed");
      }

      const updatedUser = await response.json();
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return rejectWithValue("failed to logout");
      }

      return {}; 
    } catch (error) {
      return rejectWithValue(error.message || "logout failed");
    }
  }
);

interface User {
  location: any;
  id: string;
  username: string;
  lastname: string;
  firstname: string;
  email: string;
  password?: string;
  age?: number;
  gender?: string;
  orientation?: number;
  bio?: string;
  interests?: string[];
  profilePicture?: string | null;
  pictures?: string[];
  onboarding: boolean;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as User | null,
    isAuthenticated: false as boolean,
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Erreur inconnue";
      })
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Erreur inconnue";
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Erreur inconnue";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Erreur de déconnexion";
      });
  },
});

export const { setUser, updateUser } = authSlice.actions;
export default authSlice.reducer;
