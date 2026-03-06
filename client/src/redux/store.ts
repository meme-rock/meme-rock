import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import minerReducer from "./slices/minerSlice";
import hiltiReducer from "./slices/hiltiSlice";
import boosterReducer from "./slices/boosterSlice";
import achievementsReducer from "./slices/achievementsSlice";
import taskReducer from "./slices/taskSlice";
import dailyRewardReducer from "./slices/dailyRewardSlice";
import statsReducer from "./slices/statsSlice";

import { userApi } from "./services/user/user-api";
import { boosterApi } from "./services/booster/booster-api";
import { marketApi } from "./services/market/market-api";
import { minerApi } from "./services/miner/miner-api";
import { ranksApi } from "./services/ranks/ranks-api";
import { starApi } from "./services/star/star-api";
import { tonApi } from "./services/ton/ton-api";
import { taskApi } from "./services/tasks/task-api";
import { hiltiApi } from "./services/hilti/hilti-api";
import { adApi } from "./services/ad/ad-api";
import { dailyRewardApi } from "./services/daily-reward/daily-reward-api";
import { miniGameApi } from "./services/mini-game/mini-game-api";

export const store = configureStore({
  reducer: {
    user: userReducer,
    miner: minerReducer,
    hilti: hiltiReducer,
    booster: boosterReducer,
    achievements: achievementsReducer,
    dailyReward: dailyRewardReducer,
    task: taskReducer,
    stats: statsReducer,
    [userApi.reducerPath]: userApi.reducer,
    [boosterApi.reducerPath]: boosterApi.reducer,
    [marketApi.reducerPath]: marketApi.reducer,
    [minerApi.reducerPath]: minerApi.reducer,
    [hiltiApi.reducerPath]: hiltiApi.reducer,
    [ranksApi.reducerPath]: ranksApi.reducer,
    [starApi.reducerPath]: starApi.reducer,
    [tonApi.reducerPath]: tonApi.reducer,
    [taskApi.reducerPath]: taskApi.reducer,
    [adApi.reducerPath]: adApi.reducer,
    [dailyRewardApi.reducerPath]: dailyRewardApi.reducer,
    [miniGameApi.reducerPath]: miniGameApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,
      boosterApi.middleware,
      marketApi.middleware,
      minerApi.middleware,
      hiltiApi.middleware,
      ranksApi.middleware,
      starApi.middleware,
      tonApi.middleware,
      taskApi.middleware,
      adApi.middleware,
      dailyRewardApi.middleware,
      miniGameApi.middleware
    ),
});

// Infer the type of store
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
