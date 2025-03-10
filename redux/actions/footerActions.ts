import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { server } from "@/config";

export interface UpdateAboutUsPayload {
  aboutUs: string;
}

export interface UpdateCopyrightPayload {
  copyright: string;
}

export interface UpdateCookiePolicyPayload {
  title: string;
  content: string;
}

export interface UpdateKvkPayload {
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

// Update About Us
export const updateAboutUs = createAsyncThunk(
  "footer/updateAboutUs",
  async (payload: UpdateAboutUsPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${server}/footer/about-us`,
        payload,
        config
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Update Copyright
export const updateCopyright = createAsyncThunk(
  "footer/updateCopyright",
  async (payload: UpdateCopyrightPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${server}/footer/copyright`,
        payload,
        config
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Update Cookie Policy
export const updateCookiePolicy = createAsyncThunk(
  "footer/updateCookiePolicy",
  async (payload: UpdateCookiePolicyPayload, thunkAPI) => {
    try {
      const token = localStorage.getItem("accessToken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${server}/footer/cookie-policy`,
        payload,
        config
      );
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

// Submit Form
export const submitForm = createAsyncThunk(
  "footer/submitForm",
  async (payload: FormSubmissionPayload, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${server}/footer/forms`,
        payload
      );
      return data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Delete form submission
export const deleteFormSubmission = createAsyncThunk(
  "footer/deleteFormSubmission",
  async (formId: string, thunkAPI) => {
    try {
      const { data } = await axios.delete(`${server}/footer/forms/${formId}`);
      return { formId, data };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Form başvurusu silinemedi"
      );
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
