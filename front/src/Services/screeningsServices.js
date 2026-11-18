import axios from 'axios'
import { API_URL } from './url.js'

// ALL SCREENINGS
function getAll() {
  return axios.get(API_URL + 'screenings')
}

// UPDATE PRICE
function update(id, screening) {
  return axios.patch(API_URL + 'screenings/' + id, screening)
}

export default {
  getAll,
  update,
}
