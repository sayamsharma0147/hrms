import api from './api'

export const getUsers = (role) => {
  return api.get('/users', { params: role ? { role } : undefined })
}
