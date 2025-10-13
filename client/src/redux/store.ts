import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import minerReducer from "./slices/minerSlice";
import hiltiReducer from "./slices/hiltiSlice";
import { userApi } from "./services/user/user-api";
import boosterReducer from "./slices/boosterSlice";
import { boosterApi } from "./services/booster/booster-api";

export const store = configureStore({
  reducer: {
    user: userReducer,
    miner: minerReducer,
    hilti: hiltiReducer,
    booster: boosterReducer,
    [userApi.reducerPath]: userApi.reducer,
    [boosterApi.reducerPath]: boosterApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware, boosterApi.middleware),
});

// Infer the type of store
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
