import { createSlice } from "@reduxjs/toolkit";
import {
  getFooterData,
  updateAboutUs,
  updateCopyright,
  updateCookiePolicy,
  updateKvk,
  deleteFormSubmission,
  submitForm,
  updateSocialMenu,
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

    // Update about us
    builder
      .addCase(updateAboutUs.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAboutUs.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateAboutUs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update copyright
    builder
      .addCase(updateCopyright.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCopyright.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateCopyright.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update cookie policy
    builder
      .addCase(updateCookiePolicy.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCookiePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(updateCookiePolicy.rejected, (state, action) => {
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

    // Delete form submission
    builder
      .addCase(deleteFormSubmission.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteFormSubmission.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        if (state.footer?.forms) {
          state.footer.forms = state.footer.forms.filter(
            (form: any) => form._id !== action.payload.formId
          );
        }
      })
      .addCase(deleteFormSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create form submission
    builder
      .addCase(submitForm.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.loading = false;
        state.footer = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(submitForm.rejected, (state, action) => {
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
  },
});

export const { clearError, clearSuccess } = footerSlice.actions;
export default footerSlice.reducer;
