import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import minerReducer from "./slices/minerSlice";
import hiltiReducer from "./slices/hiltiSlice";
import { userApi } from "./services/user/user-api";

export const store = configureStore({
  reducer: {
    user: userReducer,
    miner: minerReducer,
    hilti: hiltiReducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
});

// Infer the type of store
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
