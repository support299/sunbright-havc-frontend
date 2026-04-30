import { baseApi } from "../../app/api/baseApi"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login/",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Me"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout/",
        method: "POST",
      }),
      invalidatesTags: ["Me"],
    }),
    me: builder.query({
      query: () => "/auth/me/",
      providesTags: ["Me"],
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useMeQuery } = authApi
