/*
 * Appels HTTP des séances de cinéma.
 * Toutes les fonctions renvoient des promesses Axios.
 * Les composants qui les appellent utilisent async / await et try / catch.
 */
import axios from 'axios'
import { API_URL } from './url.js'

// GET /screenings : récupère la liste complète des séances
function getAll() {
  return axios.get(API_URL + 'screenings')
}

// GET /screenings/film/:filmId : récupère les séances d'un film spécifique
function getByFilm(filmId) {
  return axios.get(API_URL + 'screenings/film/' + filmId)
}

// GET /screenings/:id : récupère le détail d'une séance
function getById(id) {
  return axios.get(API_URL + 'screenings/' + id)
}

// POST /screenings : ajoute une nouvelle séance (admin uniquement)
function insert(screening) {
  return axios.post(API_URL + 'screenings', screening)
}

// PATCH /screenings/:id : met à jour la salle ou le tarif d'une séance
function update(id, screening) {
  return axios.patch(API_URL + 'screenings/' + id, screening)
}

// DELETE /screenings/:id : supprime une séance et ses réservations associées
function deleteScreening(id) {
  return axios.delete(API_URL + 'screenings/' + id)
}

export default {
  getAll,
  getByFilm,
  getById,
  insert,
  create: insert,
  update,
  deleteScreening,
  remove: deleteScreening,
}
