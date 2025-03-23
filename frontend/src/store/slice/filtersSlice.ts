import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Filters {
  age: [number, number];
  location: [number, number];
  fame: [number, number];
  tags: string[];
}

const initialState: Filters = {
  age: [0, 100],
  location: [0, 1000],
  fame: [0, 100],
  tags: [],
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    updateFilter(state, action: PayloadAction<{ key: string; value: any }>) {
      const { key, value } = action.payload;
      if (state.hasOwnProperty(key)) {
        (state as any)[key] = value;
      }
    },
  },
});

export const { updateFilter } = filtersSlice.actions;
export default filtersSlice.reducer;
