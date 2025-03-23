import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  activePage: string;
}

const initialState: NavigationState = {
  activePage: 'home',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setActivePage: (state, action: PayloadAction<string>) => {
      state.activePage = action.payload;
    },
  },
});

export const { setActivePage } = navigationSlice.actions;
export default navigationSlice.reducer;
