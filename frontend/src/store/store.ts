import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './slice/navigationSlice.ts';
import photosReducer from './slice/photosSlice.ts';
import authReducer from './slice/authSlice.ts'; 
import filtersReducer from './slice/filtersSlice.ts'
import sortReducer from "./slice/sortSlice.ts";
import locationReducer from './slice/locationSlice.ts';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    photos: photosReducer,
    auth: authReducer,
    filters: filtersReducer,
    sort: sortReducer,
    location: locationReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
