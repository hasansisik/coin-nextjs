import { createReducer } from "@reduxjs/toolkit";
import {
  register,
  login,
  loadUser,
  logout,
  verifyEmail,
  againEmail,
  forgotPassword,
  resetPassword,
  editProfile,
  getAllUsers,
  editUsers,
  deleteUser,
} from "../actions/userActions";

interface userState {
  user: any;
  loading: boolean;
  error: string | null;
  isAuthenticated?: boolean;
  message?: string;
  users?: any[];
}

const initialState: userState = {
  user: {},
  loading: false,
  error: null,
  users: [],
};

export const courseReducer = createReducer(initialState, (builder) => {
  builder
    // Register
    .addCase(register.pending, (state) => {
      state.loading = true;
    })
    .addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = action.payload;
    })
    .addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Login
    .addCase(login.pending, (state) => {
      state.loading = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Load user
    .addCase(loadUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(loadUser.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    })
    .addCase(loadUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Logout
    .addCase(logout.pending, (state) => {
      state.loading = true;
    })
    .addCase(logout.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.message = action.payload;
    })
    .addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Verify Email
    .addCase(verifyEmail.pending, (state) => {
      state.loading = true;
    })
    .addCase(verifyEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase(verifyEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Again Email
    .addCase(againEmail.pending, (state) => {
      state.loading = true;
    })
    .addCase(againEmail.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase(againEmail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Forgot Password
    .addCase(forgotPassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Reset Password
    .addCase(resetPassword.pending, (state) => {
      state.loading = true;
    })
    .addCase(resetPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Edit Profile
    .addCase(editProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(editProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.user = action.payload.user;
    })
    .addCase(editProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Edit Users
    .addCase(editUsers.pending, (state) => {
      state.loading = true;
    })
    .addCase(editUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (state.users) {
        state.users = state.users.map((user) =>
          user._id === action.payload.user._id ? action.payload.user : user
        );
      }
    })
    .addCase(editUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Delete User
    .addCase(deleteUser.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteUser.fulfilled, (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      if (state.users) {
        state.users = state.users.filter((user) => user._id !== action.payload.userId);
      }
    })
    .addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
    // Get All Users
    .addCase(getAllUsers.pending, (state) => {
      state.loading = true;
    })
    .addCase(getAllUsers.fulfilled, (state, action) => {
      state.loading = false;
      state.users = action.payload;
    })
    .addCase(getAllUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
});

export default courseReducer;