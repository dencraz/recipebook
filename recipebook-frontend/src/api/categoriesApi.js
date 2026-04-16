import api from './axiosInstance'

export const categoriesApi = {
  getAll: () => api.get('/categories').then((r) => r.data),
  create: (data) => api.post('/categories', data).then((r) => r.data),
  update: (id, data) => api.put(`/categories/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
  uploadPhoto: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api
      .post(`/categories/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
