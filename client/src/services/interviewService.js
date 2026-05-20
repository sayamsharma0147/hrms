import api from './api'

export const scheduleInterview = (data) => {
  return api.post('/interviews', data)
}

export const getInterviewsByApplication = (applicationId) => {
  return api.get('/interviews', { params: { applicationId } })
}

export const getInterviewsThisWeek = (scheduledFrom, scheduledTo) => {
  return api.get('/interviews', { params: { scheduledFrom, scheduledTo } })
}

export const getMyInterviews = (includeCompleted = false) => {
  return api.get('/interviews/mine', {
    params: { includeCompleted: includeCompleted ? 'true' : undefined },
  })
}

export const updateInterview = (id, data) => {
  return api.put(`/interviews/${id}`, data)
}

export const submitFeedback = (id, data) => {
  return api.post(`/interviews/${id}/feedback`, data)
}
