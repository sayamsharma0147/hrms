import api from './api'

export const getJobs = (filters = {}) => {
  return api.get('/jobs', { params: filters })
}

export const getJobById = (id) => {
  return api.get(`/jobs/${id}`)
}

export const createJob = (data) => {
  return api.post('/jobs', data)
}

export const updateJob = (id, data) => {
  return api.put(`/jobs/${id}`, data)
}

export const deleteJob = (id) => {
  return api.delete(`/jobs/${id}`)
}

export const changeJobStatus = (id, status) => {
  return api.patch(`/jobs/${id}/status`, { status })
}
