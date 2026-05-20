import api from './api'

export const getDashboardStats = () => api.get('/analytics/dashboard')

export const getPipelineFunnel = (jobId) =>
  api.get('/analytics/funnel', {
    params: jobId ? { jobId } : undefined,
  })

export const getTimeToHire = () => api.get('/analytics/time-to-hire')

export const getSourceBreakdown = () => api.get('/analytics/sources')

export const exportCSV = () =>
  api.get('/analytics/export', { responseType: 'blob' })

export const downloadApplicationsCSV = async () => {
  const { data } = await exportCSV()
  const url = window.URL.createObjectURL(new Blob([data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'applications_export.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
