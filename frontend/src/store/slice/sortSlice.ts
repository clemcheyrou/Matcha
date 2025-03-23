import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState = "pertinent";

const sortSlice = createSlice({
  name: "sort",
  initialState,
  reducers: {
    setSortOption: (state, action: PayloadAction<string>) => {
      return action.payload;
    },
  },
});

export const { setSortOption } = sortSlice.actions;

export default sortSlice.reducer;
