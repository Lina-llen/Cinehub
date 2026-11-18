import axios from 'axios'
import { API_URL } from './url.js'

// ALL FILMS
function getAll() {
  return axios.get(API_URL + 'films')
}

// SHOWING
function getShowing() {
  return axios.get(API_URL + 'films/showing')
}

// FILM BY ID
function getById(id) {
  return axios.get(API_URL + 'films/' + id)
}

// CREATE
function create(film) {
  return axios.post(API_URL + 'films', film)
}

// UPDATE
function update(id, film) {
  return axios.patch(API_URL + 'films/' + id, film)
}

// DELETE
function remove(id) {
  return axios.delete(API_URL + 'films/' + id)
}

export default {
  getAll,
  getShowing,
  getById,
  create,
  update,
  remove,
}
