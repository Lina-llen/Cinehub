/*
 * Appels HTTP des salles de cinéma.
 */
import axios from 'axios'
import { API_URL } from './url.js'

// GET /rooms : liste de toutes les salles
function getAll() {
  return axios.get(API_URL + 'rooms')
}

// POST /rooms : création d'une nouvelle salle
function create(room) {
  return axios.post(API_URL + 'rooms', room)
}

export default {
  getAll,
  create,
  insert: create,
}
