import api from './axiosInstance'

export const recipesApi = {
  getAll: (params) => api.get('/recipes', { params }).then((r) => r.data),
  getById: (id) => api.get(`/recipes/${id}`).then((r) => r.data),
  create: (data) => api.post('/recipes', data).then((r) => r.data),
  update: (id, data) => api.put(`/recipes/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/recipes/${id}`).then((r) => r.data),
  uploadPhoto: (id, file) => {
    const formData = new FormData()
    formData.append('photo', file)
    return api
      .post(`/recipes/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data)
  },
}
