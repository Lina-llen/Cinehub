import { useEffect, useState } from 'react'
import filmsServices from '../Services/filmsServices.js'

const emptyFilm = {
  title: '',
  description: '',
  duration: '',
  genre: '',
  release_date: '',
  is_showing: true,
}

function AdminFilmsSection() {
  const [films, setFilms] = useState([])
  const [film, setFilm] = useState(emptyFilm)
  const [editingFilm, setEditingFilm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function loadFilms() {
    filmsServices.getAll()
      .then((response) => {
        setFilms(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer les films.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadFilms()
  }, [])

  function handleChange(event) {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value
    setFilm({ ...film, [event.target.name]: value })
  }

  function startEditing(selectedFilm) {
    setEditingFilm(selectedFilm)
    setFilm({
      title: selectedFilm.fi_title,
      description: selectedFilm.fi_description || '',
      duration: selectedFilm.fi_duration,
      genre: selectedFilm.fi_genre || '',
      release_date: selectedFilm.fi_release_date
        ? String(selectedFilm.fi_release_date).slice(0, 10)
        : '',
      is_showing: Boolean(selectedFilm.fi_is_showing),
    })
    setErrorMessage('')
    setSuccessMessage('')
  }

  function cancelEditing() {
    setEditingFilm(null)
    setFilm(emptyFilm)
    setErrorMessage('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const filmData = {
      ...film,
      duration: Number(film.duration),
      release_date: film.release_date || null,
    }

    const request = editingFilm
      ? filmsServices.update(editingFilm.fi_id, filmData)
      : filmsServices.create(filmData)

    request
      .then(() => {
        setSuccessMessage(editingFilm ? 'Film modifié.' : 'Film ajouté.')
        cancelEditing()
        loadFilms()
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || "L'opération sur le film a échoué.")
      })
  }

  function handleDelete(selectedFilm) {
    if (!window.confirm(
      'Supprimer le film « ' + selectedFilm.fi_title +
      ' » ainsi que ses séances et réservations associées ? Cette action est définitive.'
    )) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    filmsServices.remove(selectedFilm.fi_id)
      .then(() => {
        setSuccessMessage('Film supprimé.')
        loadFilms()
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de supprimer ce film.')
      })
  }

  return (
    <section>
      <h2 className="h3 mb-4">Gestion des films</h2>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success" role="status">{successMessage}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h3 className="h5">{editingFilm ? 'Modifier le film' : 'Ajouter un film'}</h3>
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-6">
              <label className="form-label" htmlFor="filmTitle">Titre</label>
              <input className="form-control" id="filmTitle" name="title" value={film.title} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="filmGenre">Genre</label>
              <input className="form-control" id="filmGenre" name="genre" value={film.genre} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="filmDuration">Durée en minutes</label>
              <input className="form-control" id="filmDuration" name="duration" type="number" min="1" value={film.duration} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="filmReleaseDate">Date de sortie</label>
              <input className="form-control" id="filmReleaseDate" name="release_date" type="date" value={film.release_date} onChange={handleChange} />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <div className="form-check mb-2">
                <input className="form-check-input" id="filmShowing" name="is_showing" type="checkbox" checked={film.is_showing} onChange={handleChange} />
                <label className="form-check-label" htmlFor="filmShowing">À l’affiche</label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="filmDescription">Description</label>
              <textarea className="form-control" id="filmDescription" name="description" rows="3" value={film.description} onChange={handleChange}></textarea>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary" type="submit">
                {editingFilm ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingFilm && (
                <button className="btn btn-outline-secondary" type="button" onClick={cancelEditing}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted">Chargement des films...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Titre</th>
                <th scope="col">Genre</th>
                <th scope="col">Durée</th>
                <th scope="col">À l’affiche</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {films.map((item) => (
                <tr key={item.fi_id}>
                  <td>{item.fi_title}</td>
                  <td>{item.fi_genre || '—'}</td>
                  <td>{item.fi_duration} min</td>
                  <td>{item.fi_is_showing ? 'Oui' : 'Non'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEditing(item)}>
                        Modifier
                      </button>
                      <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDelete(item)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminFilmsSection
