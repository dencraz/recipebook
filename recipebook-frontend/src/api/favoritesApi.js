import api from './axiosInstance'

export const favoritesApi = {
  getAll: () => api.get('/favorites').then((r) => r.data),
  add: (recipeId) => api.post(`/favorites/${recipeId}`).then((r) => r.data),
  remove: (recipeId) => api.delete(`/favorites/${recipeId}`).then((r) => r.data),
}
