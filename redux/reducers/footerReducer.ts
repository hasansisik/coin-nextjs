import { createSlice } from "@reduxjs/toolkit";
import {
  getFooterData,
  updateKvk,
  updateSocialMenu,
  updateInfo, // Add this import
} from "../actions/footerActions";

interface FooterState {
  footer: any;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: FooterState = {
  footer: null,
  loading: false,
  error: null,
  success: false,
};

const footerSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Get footer data
    builder
      .addCase(getFooterData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFooterData.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.error = null;
      })
      .addCase(getFooterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update KVK
    builder
      .addCase(updateKvk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateKvk.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateKvk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update social menu
    builder
      .addCase(updateSocialMenu.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSocialMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateSocialMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Info
    builder
      .addCase(updateInfo.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccess } = footerSlice.actions;
export default footerSlice.reducer;
