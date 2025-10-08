// init-data-header.ts
"use client";

import { type BaseQueryFn, fetchBaseQuery } from "@reduxjs/toolkit/query";

async function getTelegramInitData() {
  if (typeof window !== "undefined") {
    const { default: WebApp } = await import("@twa-dev/sdk");
    return WebApp.initData; // <-- toString() kaldırdım
  }
  return null;
}

export const initDataHeader = (baseUrl: string): BaseQueryFn => {
  return async (args, api, extraOptions) => {
    const initData = await getTelegramInitData();

    const rawBaseQuery = fetchBaseQuery({
      baseUrl,
      prepareHeaders: (headers) => {
        if (initData) {
          headers.set("x-telegram-init-data", initData);
        }
        return headers;
      },
    });

    return rawBaseQuery(args, api, extraOptions);
  };
};
