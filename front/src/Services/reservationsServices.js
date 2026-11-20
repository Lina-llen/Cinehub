import axios from 'axios'
import { API_URL } from './url.js'

// ALL RESERVATIONS
function getAll() {
  return axios.get(API_URL + 'reservations')
}

// MY RESERVATIONS
function getMine() {
  return axios.get(API_URL + 'reservations/me')
}

// CREATE
function create(screening, seats = 1) {
  return axios.post(API_URL + 'reservations', { screening, seats })
}

// CANCEL
function cancel(id) {
  return axios.delete(API_URL + 'reservations/' + id)
}

export default {
  getAll,
  getMine,
  create,
  insert: create,
  cancel,
  deleteReservation: cancel,
}
