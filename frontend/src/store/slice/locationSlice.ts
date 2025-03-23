import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  lat: number | null;
  lng: number | null;
  isLocationSet: boolean;
}

const initialState: LocationState = {
  lat: null,
  lng: null,
  isLocationSet: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.isLocationSet = true;
    },
    resetLocation: (state) => {
      state.lat = null;
      state.lng = null;
      state.isLocationSet = false;
    },
  },
});

export const { setLocation, resetLocation } = locationSlice.actions;

export default locationSlice.reducer;
