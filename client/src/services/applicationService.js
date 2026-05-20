import api from './api'

export const submitApplication = (formData, onUploadProgress) => {
  return api.post('/applications', formData, {
    onUploadProgress: (event) => {
      if (onUploadProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total)
        onUploadProgress(percent)
      }
    },
  })
}

export const getApplicationsByJob = (jobId, stage) => {
  return api.get('/applications', {
    params: { jobId, stage: stage || undefined },
  })
}

export const getApplicationById = (id) => {
  return api.get(`/applications/${id}`)
}

export const updateStage = (id, stage, note) => {
  return api.patch(`/applications/${id}/stage`, { stage, note })
}

export const addNote = (id, text) => {
  return api.post(`/applications/${id}/notes`, { text })
}

export const deleteApplication = (id) => {
  return api.delete(`/applications/${id}`)
}
