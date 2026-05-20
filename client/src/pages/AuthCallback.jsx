import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'
import useAuth from '../hooks/useAuth'

export default function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuthSession } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token')
      if (!token) {
        setError('Google sign-in failed. Please try again.')
        return
      }

      localStorage.setItem('token', token)
      try {
        const { data } = await api.get('/auth/me')
        setAuthSession(token, data)
        navigate('/dashboard', { replace: true })
      } catch {
        localStorage.removeItem('token')
        setError('Could not complete sign-in. Please log in again.')
      }
    }

    handleCallback()
  }, [navigate, searchParams, setAuthSession])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
        {error ? (
          <>
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
            <p className="text-gray-600 mt-4">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  )
}
