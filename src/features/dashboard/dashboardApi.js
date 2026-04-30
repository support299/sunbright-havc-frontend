import { baseApi } from "../../app/api/baseApi"

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "/catalog/products/",
      providesTags: ["Products"],
    }),
    getIncludedItems: builder.query({
      query: () => "/catalog/items/",
      providesTags: ["Items"],
    }),
    getFinancePlans: builder.query({
      query: () => "/finance/plans/",
      providesTags: ["FinancePlans"],
    }),
    getFinanceLinks: builder.query({
      query: () => "/finance/links/",
      providesTags: ["FinanceLinks"],
    }),
    getProposals: builder.query({
      query: () => "/proposals/",
      providesTags: ["Proposals"],
    }),
    getProposal: builder.query({
      query: (id) => `/proposals/${id}/`,
      providesTags: ["Proposals"],
    }),
    getAppSettings: builder.query({
      query: () => "/catalog/settings/",
      providesTags: ["Settings"],
    }),
    /** Cities, utilities, tier names & defaults — single source for proposal UI */
    getCatalogReference: builder.query({
      query: () => "/catalog/reference/",
      providesTags: ["CatalogReference"],
    }),
    updateProposal: builder.mutation({
      query: ({ id, body }) => ({
        url: `/proposals/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Proposals"],
    }),
    createProposal: builder.mutation({
      query: (body) => ({
        url: "/proposals/",
        method: "POST",
        body: body ?? {
          customer_name: "",
          customer_address: "",
          zones: [],
          tiers: [],
          status: "open",
        },
      }),
      invalidatesTags: ["Proposals"],
    }),
    updateProposalStatus: builder.mutation({
      query: ({ id, status, selected_tier_index }) => ({
        url: `/proposals/${id}/status/`,
        method: "POST",
        body: {
          status,
          ...(selected_tier_index !== undefined ? { selected_tier_index } : {}),
        },
      }),
      invalidatesTags: ["Proposals"],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: "/catalog/products/", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, body }) => ({ url: `/catalog/products/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/catalog/products/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),
    createIncludedItem: builder.mutation({
      query: (body) => ({ url: "/catalog/items/", method: "POST", body }),
      invalidatesTags: ["Items"],
    }),
    updateIncludedItem: builder.mutation({
      query: ({ id, body }) => ({ url: `/catalog/items/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["Items"],
    }),
    deleteIncludedItem: builder.mutation({
      query: (id) => ({ url: `/catalog/items/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Items"],
    }),
    updateAppSetting: builder.mutation({
      query: ({ id, body }) => ({ url: `/catalog/settings/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["Settings", "CatalogReference"],
    }),
    createFinanceLink: builder.mutation({
      query: (body) => ({ url: "/finance/links/", method: "POST", body }),
      invalidatesTags: ["FinanceLinks"],
    }),
    updateFinanceLink: builder.mutation({
      query: ({ id, body }) => ({ url: `/finance/links/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["FinanceLinks"],
    }),
    deleteFinanceLink: builder.mutation({
      query: (id) => ({ url: `/finance/links/${id}/`, method: "DELETE" }),
      invalidatesTags: ["FinanceLinks"],
    }),
    createFinancePlan: builder.mutation({
      query: (body) => ({ url: "/finance/plans/", method: "POST", body }),
      invalidatesTags: ["FinancePlans"],
    }),
    updateFinancePlan: builder.mutation({
      query: ({ id, body }) => ({ url: `/finance/plans/${id}/`, method: "PATCH", body }),
      invalidatesTags: ["FinancePlans"],
    }),
    deleteFinancePlan: builder.mutation({
      query: (id) => ({ url: `/finance/plans/${id}/`, method: "DELETE" }),
      invalidatesTags: ["FinancePlans"],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetIncludedItemsQuery,
  useGetFinancePlansQuery,
  useGetFinanceLinksQuery,
  useGetProposalsQuery,
  useGetProposalQuery,
  useGetCatalogReferenceQuery,
  useGetAppSettingsQuery,
  useUpdateProposalMutation,
  useCreateProposalMutation,
  useUpdateProposalStatusMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateIncludedItemMutation,
  useUpdateIncludedItemMutation,
  useDeleteIncludedItemMutation,
  useUpdateAppSettingMutation,
  useCreateFinanceLinkMutation,
  useUpdateFinanceLinkMutation,
  useDeleteFinanceLinkMutation,
  useCreateFinancePlanMutation,
  useUpdateFinancePlanMutation,
  useDeleteFinancePlanMutation,
} = dashboardApi
