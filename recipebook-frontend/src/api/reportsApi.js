import api from './axiosInstance'

export const reportsApi = {
  getFavorites: (params) => api.get('/reports/favorites', { params }).then((r) => r.data),
  getCategories: (params) => api.get('/reports/categories', { params }).then((r) => r.data),
  downloadFavoritesXlsx: () =>
    api.get('/reports/favorites/xlsx', { responseType: 'blob' }).then((r) => r.data),
  downloadFavoritesPdf: () =>
    api.get('/reports/favorites/pdf', { responseType: 'blob' }).then((r) => r.data),
  downloadCategoriesXlsx: () =>
    api.get('/reports/categories/xlsx', { responseType: 'blob' }).then((r) => r.data),
  downloadCategoriesPdf: () =>
    api.get('/reports/categories/pdf', { responseType: 'blob' }).then((r) => r.data),
}
