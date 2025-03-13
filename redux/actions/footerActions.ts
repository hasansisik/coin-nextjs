import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { server } from "@/config";

export interface UpdateKvkPayload {
  title: string;
  content: string;
}

export interface UpdateInfoPayload {
  title: string;
  content: string;
}

export interface FormSubmissionPayload {
  email: string;
  message: string;
}

export interface UpdateSocialMenuPayload {
  title: string;
  url: string;
}

// Get Footer Data
export const getFooterData = createAsyncThunk(
  "footer/getAll",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${server}/footer`);
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Update KVK
export const updateKvk = createAsyncThunk(
  "footer/updateKvk",
  async (payload: UpdateKvkPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${server}/footer/kvk`,
        payload,
        config
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Update Info
export const updateInfo = createAsyncThunk(
  "footer/updateInfo",
  async (payload: UpdateInfoPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${server}/footer/info`,
        payload,
        config
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Update Social Menu
export const updateSocialMenu = createAsyncThunk(
  "footer/updateSocialMenu",
  async (payload: UpdateSocialMenuPayload[], thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${server}/footer/social-menu`,
        payload,
        config
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteSocialMenuItem = createAsyncThunk(
  "footer/deleteSocialMenuItem",
  async (itemId: string, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.delete(
        `${server}/footer/social-menu/${itemId}`,
        config
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);
