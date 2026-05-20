import { createContext, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// AuthProvider must be rendered inside BrowserRouter (see main.jsx).

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token')

      if (!storedToken) {
        setLoading(false)
        return
      }

      setToken(storedToken)

      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData)
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const setAuthSession = useCallback((nextToken, nextUser) => {
    localStorage.setItem('token', nextToken)
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, setAuthSession }}
    >
      {children}
    </AuthContext.Provider>
  )
}
