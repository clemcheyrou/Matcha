import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Photo {
  caption: string | undefined;
  media_url: string | undefined;
  id: number;
  url: string;
}

interface PhotosState {
  photos: Photo[];
  profilePicture: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: PhotosState = {
  photos: [],
  profilePicture: null,
  loading: false,
  error: null,
};

export const fetchPhotos = createAsyncThunk(
  'photos/fetchPhotos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/photos`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.photos) {
        return data.photos;
      }
      return [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePhoto = createAsyncThunk(
  'photos/deletePhoto',
  async (photoId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        return rejectWithValue('error deleting photo');
      }

      return photoId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPhoto = createAsyncThunk(
  'photos/addPhoto',
  async (file: File, { rejectWithValue }) => {
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/uploads`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        return rejectWithValue('error uploading photo');
      }

      const data = await response.json();
      return data.photo;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const photosSlice = createSlice({
  name: 'photos',
  initialState,
  reducers: {
    setProfilePicture: (state, action) => {
      state.profilePicture = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPhotos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPhotos.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload;
        const profilePhoto = action.payload[0];
        if (profilePhoto) {
          state.profilePicture = profilePhoto.url;
        }
      })
      .addCase(fetchPhotos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.photos = state.photos.filter(photo => photo.id !== action.payload);
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(addPhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPhoto.fulfilled, (state, action) => {
        state.loading = false;
        state.photos.push(action.payload);
      })
      .addCase(addPhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProfilePicture } = photosSlice.actions;
export default photosSlice.reducer;
