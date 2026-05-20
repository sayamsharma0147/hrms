import axios from 'axios'
import { notifyError } from '../utils/toastBridge'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message
    if (message && !error.config?.skipErrorToast) {
      notifyError(message)
    }
    return Promise.reject(error)
  }
)

export default api
