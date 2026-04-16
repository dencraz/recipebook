import api from './axiosInstance'

export const authApi = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  refresh: (refreshToken) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  updateProfile: (data) => api.patch('/auth/profile', data).then((r) => r.data),
  updateAvatar: (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.patch('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
}
