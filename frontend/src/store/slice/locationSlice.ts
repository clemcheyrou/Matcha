import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  lat: number | null;
  lng: number | null;
  city: string | null;
  isLocationSet: boolean;
}

const initialState: LocationState = {
  lat: null,
  lng: null,
  city: null,
  isLocationSet: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ lat: number; lng: number; city: string }>) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.city = action.payload.city;
      state.isLocationSet = true;
    },
    resetLocation: (state) => {
      state.lat = null;
      state.lng = null;
      state.city = null;
      state.isLocationSet = false;
    },
  },
});

export const { setLocation, resetLocation } = locationSlice.actions;

export default locationSlice.reducer;
