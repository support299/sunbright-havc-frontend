import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["Me", "Products", "Items", "FinancePlans", "FinanceLinks", "Proposals", "Settings", "CatalogReference"],
  endpoints: () => ({}),
})
