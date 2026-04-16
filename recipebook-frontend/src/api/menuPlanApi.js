import api from './axiosInstance'

export const menuPlanApi = {
  getWeek: (weekStart) =>
    api.get('/menu-plan', { params: { week_start: weekStart } }).then((r) => r.data),
  setSlot: (data) => api.put('/menu-plan', data).then((r) => r.data),
  removeSlot: (id) => api.delete(`/menu-plan/${id}`).then((r) => r.data),
  downloadShoppingList: (weekStart) =>
    api
      .get('/menu-plan/shopping-list/pdf', {
        params: { week_start: weekStart },
        responseType: 'blob',
      })
      .then((r) => r.data),
}
