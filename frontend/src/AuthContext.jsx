import { createContext, useContext, useState } from 'react'
import api from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  async function login(email, password) {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    setToken(data.token)
  }

  async function logout() {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)