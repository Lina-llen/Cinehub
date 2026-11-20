import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { API_URL } from './url.js'

// LOGIN
async function login(user) {
  const response = await axios.post(API_URL + 'auth/login', user)
  const token = response.data.token
  window.localStorage.setItem('token', token)
  axios.defaults.headers.common.Authorization = 'Bearer ' + token
  return response
}

// REGISTER
function register(user) {
  return axios.post(API_URL + 'auth/register', user)
}

// CONNECTION
function isConnected() {
  const token = window.localStorage.getItem('token')
  if (token) {
    try {
      const decoded = jwtDecode(token)
      if (decoded.exp > Date.now() / 1000) {
        axios.defaults.headers.common.Authorization = 'Bearer ' + token
        return true
      }
    } catch {
      window.localStorage.removeItem('token')
      delete axios.defaults.headers.common.Authorization
      return false
    }
    window.localStorage.removeItem('token')
  }
  delete axios.defaults.headers.common.Authorization
  return false
}

// USER
function getUser() {
  if (isConnected()) {
    const token = window.localStorage.getItem('token')
    const decoded = jwtDecode(token)
    return {
      us_id: decoded.us_id,
      us_username: decoded.us_username,
      us_email: decoded.us_email,
      us_role: decoded.us_role,
    }
  }
  return null
}

// LOGOUT
function logout() {
  window.localStorage.removeItem('token')
  delete axios.defaults.headers.common.Authorization
}

export default {
  login,
  register,
  isConnected,
  getUser,
  logout,
}
