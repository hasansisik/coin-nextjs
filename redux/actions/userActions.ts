import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { server } from "@/config";
import { syncTokenToCookie } from "@/utils/auth";

export interface RegisterPayload {
  name: string;
  email: string;
  picture?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyEmailPayload {
  email: string;
  verificationCode: number;
}

export interface ResetPasswordPayload {
  email: string;
  passwordToken: number;
  newPassword: string;
}

export interface EditProfilePayload {
  name?: string;
  email?: string;
  password?: string;
  picture?: string;
}

export interface EditUserPayload {
  id: string;  // userId yerine id kullanacağız
  name: string;
  email: string;
  role: string;
}

export interface AgainEmailPayload {
  email: string;
}

export const register = createAsyncThunk(
  "user/register",
  async (payload: RegisterPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/register`, payload);
      localStorage.setItem("accessToken", data.user.token);
      syncTokenToCookie(); // Token'ı cookie'ye senkronize et
      return data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const login = createAsyncThunk(
  "user/login",
  async (payload: LoginPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/login`, payload);
      const token = data.user.token;
      localStorage.setItem("accessToken", token);
      document.cookie = `token=${token}; path=/`;
      return data.user;
    } catch (error: any) {
      // API'den gelen hata mesajını yakala
      const errorMessage = error.response?.data?.message || 
                         'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const loadUser = createAsyncThunk(
  "user/loadUser",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.user;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem("accessToken");
    const { data } = await axios.get(`${server}/auth/logout`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("accessToken");
    syncTokenToCookie(); // Token'ı cookie'den sil
    return data.message;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const verifyEmail = createAsyncThunk(
  "user/verifyEmail",
  async (payload: VerifyEmailPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/verify-email`, payload);
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const againEmail = createAsyncThunk(
  "user/againEmail",
  async (payload: AgainEmailPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/again-email`, payload);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (email: string, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/forgot-password`, { email });
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (payload: ResetPasswordPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${server}/auth/reset-password`, payload);
      return data.message;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const editProfile = createAsyncThunk(
  "user/editProfile",
  async (formData: EditProfilePayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${server}/auth/edit-profile`,
        formData,
        config
      );
      return response.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.get(`${server}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data.users;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const editUsers = createAsyncThunk(
  "user/editUsers",
  async (payload: EditUserPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { id, ...updateData } = payload;  // id'yi ayırıp geri kalanını updateData'ya koy
      const { data } = await axios.put(
        `${server}/auth/users/${id}`,  // userId yerine id kullanıyoruz
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const { data } = await axios.delete(`${server}/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { userId, message: data.message };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);