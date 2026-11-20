import axios from 'axios'
import { API_URL } from './url.js'

// MY PROFILE
function getMe() {
  return axios.get(API_URL + 'users/me')
}

// ALL USERS
function getAll() {
  return axios.get(API_URL + 'users')
}

// UPDATE
function update(id, user) {
  return axios.patch(API_URL + 'users/' + id, user)
}

// CHANGE OWN PASSWORD
function changeMyPassword(passwords) {
  return axios.patch(API_URL + 'users/me/password', passwords)
}

// DELETE
function remove(id) {
  return axios.delete(API_URL + 'users/' + id)
}

export default {
  getMe,
  getAll,
  update,
  changeMyPassword,
  remove,
}
