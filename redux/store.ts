// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import footerReducer from "./reducers/footerReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    footer: footerReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
