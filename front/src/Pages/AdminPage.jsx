import { useEffect, useState } from 'react'
import Header from '../Components/Header.jsx'
import filmsServices from '../Services/filmsServices.js'
import reservationsServices from '../Services/reservationsServices.js'
import screeningsServices from '../Services/screeningsServices.js'
import usersServices from '../Services/usersServices.js'

const emptyFilm = {
  title: '',
  description: '',
  duration: '',
  genre: '',
  release_date: '',
  is_showing: true,
}

function formatDate(value) {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

function getErrorMessage(error, fallback) {
  const message = error.response && error.response.data && error.response.data.error
  return message || fallback
}

function AdminPage() {
  const [activeSection, setActiveSection] = useState('films')
  const [films, setFilms] = useState([])
  const [users, setUsers] = useState([])
  const [screenings, setScreenings] = useState([])
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [film, setFilm] = useState(emptyFilm)
  const [editingFilm, setEditingFilm] = useState(null)
  const [editingScreening, setEditingScreening] = useState(null)
  const [price, setPrice] = useState('')
  const [cancellingReservationId, setCancellingReservationId] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [user, setUser] = useState({ username: '', email: '' })

  useEffect(() => {
    let isCurrent = true
    let request

    if (activeSection === 'films') {
      request = filmsServices.getAll()
    } else if (activeSection === 'users') {
      request = usersServices.getAll()
    } else if (activeSection === 'screenings') {
      request = screeningsServices.getAll()
    } else {
      request = reservationsServices.getAll()
    }

    request
      .then((response) => {
        if (!isCurrent) {
          return
        }

        if (activeSection === 'films') {
          setFilms(response.data)
        } else if (activeSection === 'users') {
          setUsers(response.data)
        } else if (activeSection === 'screenings') {
          setScreenings(response.data)
        } else {
          setReservations(response.data)
        }
      })
      .catch((error) => {
        if (!isCurrent) {
          return
        }
        const messages = {
          films: 'Impossible de récupérer les films.',
          users: 'Impossible de récupérer les utilisateurs.',
          screenings: 'Impossible de récupérer les séances.',
          reservations: 'Impossible de récupérer les réservations.',
        }
        setErrorMessage(getErrorMessage(error, messages[activeSection]))
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeSection, refreshKey])

  function changeSection(section) {
    if (section === activeSection) {
      return
    }

    setIsLoading(true)
    setActiveSection(section)
    setErrorMessage('')
    setSuccessMessage('')
    setEditingFilm(null)
    setFilm(emptyFilm)
    setEditingScreening(null)
    setPrice('')
    setSelectedUser(null)
    setViewingUser(null)
  }

  function refreshSection() {
    setIsLoading(true)
    setRefreshKey((current) => current + 1)
  }

  function handleFilmChange(event) {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value
    setFilm((current) => ({ ...current, [event.target.name]: value }))
  }

  function startEditingFilm(selectedFilm) {
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

  function cancelFilmEditing() {
    setEditingFilm(null)
    setFilm(emptyFilm)
    setErrorMessage('')
  }

  function handleFilmSubmit(event) {
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
        cancelFilmEditing()
        refreshSection()
      })
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, "L'opération sur le film a échoué."))
      })
  }

  function handleFilmDelete(selectedFilm) {
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
        refreshSection()
      })
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, 'Impossible de supprimer ce film.'))
      })
  }

  function startEditingScreening(screening) {
    setEditingScreening(screening)
    setPrice(String(screening.sc_price))
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleScreeningSubmit(event, screening) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    screeningsServices.update(screening.sc_id, { price: Number(price) })
      .then(() => {
        setSuccessMessage('Prix de la séance modifié.')
        setEditingScreening(null)
        refreshSection()
      })
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, 'Impossible de modifier le prix de cette séance.'))
      })
  }

  function handleReservationCancel(reservation) {
    if (!window.confirm('Annuler la réservation de ' + reservation.us_username + ' pour « ' + reservation.fi_title + ' » ?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setCancellingReservationId(reservation.re_id)
    reservationsServices.cancel(reservation.re_id)
      .then(() => {
        setReservations((current) => current.filter((item) => item.re_id !== reservation.re_id))
        setSuccessMessage('Réservation annulée.')
      })
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, 'Impossible d’annuler cette réservation.'))
      })
      .finally(() => setCancellingReservationId(null))
  }

  function startEditingUser(selected) {
    setSelectedUser(selected)
    setUser({ username: selected.us_username, email: selected.us_email })
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleUserChange(event) {
    setUser((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleUserSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const userData = { username: user.username, email: user.email }
    usersServices.update(selectedUser.us_id, userData)
      .then(() => {
        setSuccessMessage('Compte modifié.')
        setSelectedUser(null)
        refreshSection()
      })
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, 'Impossible de modifier ce compte.'))
      })
  }

  function handleUserDelete(selected) {
    if (!window.confirm('Supprimer le compte de ' + selected.us_username + ' ?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    usersServices.remove(selected.us_id)
      .then(() => {
        setSuccessMessage('Compte supprimé.')
        if (selectedUser && selectedUser.us_id === selected.us_id) {
          setSelectedUser(null)
        }
        refreshSection()
      })
      .catch((error) => {
        setErrorMessage(getErrorMessage(error, 'Impossible de supprimer ce compte.'))
      })
  }

  return (
    <div>
      <Header />
      <main className="container py-5">
        <h1 className="display-5 fw-bold mb-4">Administration</h1>

        <nav className="nav nav-pills gap-2 mb-4" aria-label="Sections d’administration">
          <button
            className={'btn ' + (activeSection === 'films' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => changeSection('films')}
          >
            Films
          </button>
          <button
            className={'btn ' + (activeSection === 'users' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => changeSection('users')}
          >
            Utilisateurs
          </button>
          <button
            className={'btn ' + (activeSection === 'screenings' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => changeSection('screenings')}
          >
            Séances
          </button>
          <button
            className={'btn ' + (activeSection === 'reservations' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => changeSection('reservations')}
          >
            Réservations
          </button>
        </nav>

        {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success" role="status">{successMessage}</div>}

        {activeSection === 'films' && (
          <section>
            <h2 className="h3 mb-4">Gestion des films</h2>

            <div className="card mb-4">
              <div className="card-body">
                <h3 className="h5">{editingFilm ? 'Modifier le film' : 'Ajouter un film'}</h3>
                <form className="row g-3" onSubmit={handleFilmSubmit}>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="filmTitle">Titre</label>
                    <input className="form-control" id="filmTitle" name="title" value={film.title} onChange={handleFilmChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="filmGenre">Genre</label>
                    <input className="form-control" id="filmGenre" name="genre" value={film.genre} onChange={handleFilmChange} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="filmDuration">Durée en minutes</label>
                    <input className="form-control" id="filmDuration" name="duration" type="number" min="1" value={film.duration} onChange={handleFilmChange} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label" htmlFor="filmReleaseDate">Date de sortie</label>
                    <input className="form-control" id="filmReleaseDate" name="release_date" type="date" value={film.release_date} onChange={handleFilmChange} />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <div className="form-check mb-2">
                      <input className="form-check-input" id="filmShowing" name="is_showing" type="checkbox" checked={film.is_showing} onChange={handleFilmChange} />
                      <label className="form-check-label" htmlFor="filmShowing">À l’affiche</label>
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="filmDescription">Description</label>
                    <textarea className="form-control" id="filmDescription" name="description" rows="3" value={film.description} onChange={handleFilmChange}></textarea>
                  </div>
                  <div className="col-12 d-flex gap-2">
                    <button className="btn btn-primary" type="submit">
                      {editingFilm ? 'Enregistrer' : 'Ajouter'}
                    </button>
                    {editingFilm && (
                      <button className="btn btn-outline-secondary" type="button" onClick={cancelFilmEditing}>
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
                            <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEditingFilm(item)}>
                              Modifier
                            </button>
                            <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleFilmDelete(item)}>
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
        )}

        {activeSection === 'users' && (
          <section>
            <h2 className="h3 mb-4">Gestion des utilisateurs</h2>

            {viewingUser && (
              <div className="card mb-4">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <h3 className="h5">Profil de {viewingUser.us_username}</h3>
                      <p className="mb-1"><strong>E-mail :</strong> {viewingUser.us_email}</p>
                      <p className="mb-1"><strong>Rôle :</strong> {viewingUser.us_role}</p>
                      <p className="mb-0">
                        <strong>Réservations :</strong> {Number(viewingUser.reservation_count) || 0}
                      </p>
                    </div>
                    <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => setViewingUser(null)}>
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="card mb-4">
                <div className="card-body">
                  <h3 className="h5">Modifier le compte de {selectedUser.us_username}</h3>
                  <form className="row g-3" onSubmit={handleUserSubmit}>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="userUsername">Nom d’utilisateur</label>
                      <input className="form-control" id="userUsername" name="username" value={user.username} onChange={handleUserChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="userEmail">Adresse e-mail</label>
                      <input className="form-control" id="userEmail" name="email" type="email" value={user.email} onChange={handleUserChange} required />
                    </div>
                    <div className="col-12 d-flex gap-2">
                      <button className="btn btn-primary" type="submit">Enregistrer</button>
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedUser(null)}>
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isLoading ? (
              <p className="text-muted">Chargement des utilisateurs...</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Nom d’utilisateur</th>
                      <th scope="col">E-mail</th>
                      <th scope="col">Rôle</th>
                      <th scope="col">Réservations</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.us_id}>
                        <td>{item.us_username}</td>
                        <td>{item.us_email}</td>
                        <td>{item.us_role}</td>
                        <td>{Number(item.reservation_count) || 0}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => setViewingUser(item)}>
                              Profil
                            </button>
                            <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEditingUser(item)}>
                              Modifier
                            </button>
                            <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleUserDelete(item)}>
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
        )}

        {activeSection === 'screenings' && (
          <section>
            <h2 className="h3 mb-4">Gestion des séances</h2>

            {isLoading ? (
              <p className="text-muted">Chargement des séances...</p>
            ) : screenings.length === 0 ? (
              <div className="alert alert-info" role="status">Aucune séance pour le moment.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Film</th>
                      <th scope="col">Date</th>
                      <th scope="col">Salle</th>
                      <th scope="col">Prix</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screenings.map((screening) => (
                      <tr key={screening.sc_id}>
                        <td>{screening.fi_title}</td>
                        <td>{formatDate(screening.sc_datetime)}</td>
                        <td>{screening.ro_name}</td>
                        <td>
                          {editingScreening && editingScreening.sc_id === screening.sc_id ? (
                            <form
                              className="d-flex align-items-center gap-2"
                              onSubmit={(event) => handleScreeningSubmit(event, screening)}
                            >
                              <label className="visually-hidden" htmlFor={'screeningPrice-' + screening.sc_id}>
                                Prix en euros
                              </label>
                              <input
                                className="form-control"
                                id={'screeningPrice-' + screening.sc_id}
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                required
                              />
                              <span>€</span>
                              <button className="btn btn-sm btn-primary" type="submit">Enregistrer</button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                type="button"
                                onClick={() => setEditingScreening(null)}
                              >
                                Annuler
                              </button>
                            </form>
                          ) : (
                            Number(screening.sc_price).toFixed(2) + ' €'
                          )}
                        </td>
                        <td>
                          {(!editingScreening || editingScreening.sc_id !== screening.sc_id) && (
                            <button
                              className="btn btn-sm btn-outline-primary"
                              type="button"
                              onClick={() => startEditingScreening(screening)}
                            >
                              Modifier le prix
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === 'reservations' && (
          <section>
            <h2 className="h3 mb-4">Toutes les réservations</h2>

            {isLoading && <p className="text-muted">Chargement des réservations...</p>}
            {!isLoading && !errorMessage && reservations.length === 0 && (
              <div className="alert alert-info" role="status">Aucune réservation pour le moment.</div>
            )}

            {!isLoading && !errorMessage && reservations.length > 0 && (
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Utilisateur</th>
                      <th scope="col">Film</th>
                      <th scope="col">Séance</th>
                      <th scope="col">Salle</th>
                      <th scope="col">Places</th>
                      <th scope="col">Total</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <tr key={reservation.re_id}>
                        <td>{reservation.us_username}</td>
                        <td>{reservation.fi_title}</td>
                        <td>{formatDate(reservation.sc_datetime)}</td>
                        <td>{reservation.ro_name}</td>
                        <td>{reservation.re_seats}</td>
                        <td>{(Number(reservation.sc_price) * Number(reservation.re_seats)).toFixed(2)} €</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            disabled={cancellingReservationId === reservation.re_id}
                            onClick={() => handleReservationCancel(reservation)}
                          >
                            {cancellingReservationId === reservation.re_id ? 'Annulation...' : 'Annuler'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}

export default AdminPage
