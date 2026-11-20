import axios from 'axios'
import { API_URL } from './url.js'

function createFilmFormData(film, imageFile) {
  const formData = new FormData()

  Object.entries(film).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value === null ? '' : String(value))
    }
  })

  if (imageFile) {
    formData.append('image', imageFile)
  }

  return formData
}

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
function create(film, imageFile) {
  return axios.post(API_URL + 'films', createFilmFormData(film, imageFile))
}

// UPDATE
function update(id, film, imageFile) {
  return axios.patch(API_URL + 'films/' + id, createFilmFormData(film, imageFile))
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
  insert: create,
  update,
  remove,
  deleteFilm: remove,
}

export function getFilmImageUrl(imagePath) {
  if (!imagePath) {
    return null
  }

  const encodedPath = imagePath.split('/').map(encodeURIComponent).join('/')
  return API_URL + 'uploads/' + encodedPath
}
