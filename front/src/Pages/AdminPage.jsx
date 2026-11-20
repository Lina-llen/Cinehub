import { useEffect, useRef, useState } from 'react'
import Header from '../Components/Header.jsx'
import filmsServices, { getFilmImageUrl } from '../Services/filmsServices.js'
import reservationsServices from '../Services/reservationsServices.js'
import roomsServices from '../Services/roomsServices.js'
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

const emptyRoom = {
  name: '',
  capacity: '',
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
  const [rooms, setRooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [film, setFilm] = useState(emptyFilm)
  const [editingFilm, setEditingFilm] = useState(null)
  const [filmImage, setFilmImage] = useState(null)
  const filmImageInput = useRef(null)
  const [editingScreening, setEditingScreening] = useState(null)
  const [price, setPrice] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isSavingScreening, setIsSavingScreening] = useState(false)
  const [screeningForm, setScreeningForm] = useState({
    film: '',
    room: '',
    datetime: '',
    price: '',
  })
  const [isCreatingScreening, setIsCreatingScreening] = useState(false)
  const [roomForm, setRoomForm] = useState(emptyRoom)
  const [isSavingRoom, setIsSavingRoom] = useState(false)
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
      request = Promise.all([screeningsServices.getAll(), roomsServices.getAll(), filmsServices.getAll()])
    } else if (activeSection === 'rooms') {
      request = roomsServices.getAll()
    } else {
      request = reservationsServices.getAll()
    }

    async function loadSection() {
      try {
        const response = await request
        if (!isCurrent) {
          return
        }

        if (activeSection === 'screenings') {
          const [screeningsResponse, roomsResponse, filmsResponse] = response
          setScreenings(screeningsResponse.data)
          setRooms(roomsResponse.data)
          setFilms(filmsResponse.data)
        } else if (activeSection === 'films') {
          setFilms(response.data)
        } else if (activeSection === 'users') {
          setUsers(response.data)
        } else if (activeSection === 'rooms') {
          setRooms(response.data)
        } else {
          setReservations(response.data)
        }
      } catch (error) {
        if (!isCurrent) {
          return
        }
        const messages = {
          films: 'Impossible de récupérer les films.',
          users: 'Impossible de récupérer les utilisateurs.',
          screenings: 'Impossible de récupérer les séances.',
          rooms: 'Impossible de récupérer les salles.',
          reservations: 'Impossible de récupérer les réservations.',
        }
        setErrorMessage(getErrorMessage(error, messages[activeSection]))
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadSection()

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
    setFilmImage(null)
    if (filmImageInput.current) {
      filmImageInput.current.value = ''
    }
    setEditingScreening(null)
    setPrice('')
    setRoomId('')
    setRoomForm(emptyRoom)
    setScreeningForm({ film: '', room: '', datetime: '', price: '' })
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
    setFilmImage(null)
    if (filmImageInput.current) {
      filmImageInput.current.value = ''
    }
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
    setFilmImage(null)
    if (filmImageInput.current) {
      filmImageInput.current.value = ''
    }
    setErrorMessage('')
  }

  function handleFilmImageChange(event) {
    setFilmImage(event.target.files[0] || null)
  }

  async function handleFilmSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const filmData = {
      ...film,
      duration: Number(film.duration),
      release_date: film.release_date || null,
    }

    try {
      if (editingFilm) {
        await filmsServices.update(editingFilm.fi_id, filmData, filmImage)
      } else {
        await filmsServices.create(filmData, filmImage)
      }
      setSuccessMessage(editingFilm ? 'Film modifié.' : 'Film ajouté.')
      cancelFilmEditing()
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "L'opération sur le film a échoué."))
    }
  }

  async function handleFilmDelete(selectedFilm) {
    if (!window.confirm(
      'Supprimer le film « ' + selectedFilm.fi_title +
      ' » ainsi que ses séances et réservations associées ? Cette action est définitive.'
    )) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    try {
      await filmsServices.remove(selectedFilm.fi_id)
      setSuccessMessage('Film supprimé.')
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de supprimer ce film.'))
    }
  }

  function startEditingScreening(screening) {
    setEditingScreening(screening)
    setPrice(String(screening.sc_price))
    setRoomId(String(screening.sc_room))
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleScreeningSubmit(screening) {
    setErrorMessage('')
    setSuccessMessage('')
    setIsSavingScreening(true)

    try {
      await screeningsServices.update(screening.sc_id, {
        room: Number(roomId),
        price: Number(price),
      })
      setSuccessMessage('Séance modifiée.')
      setEditingScreening(null)
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de modifier cette séance.'))
    } finally {
      setIsSavingScreening(false)
    }
  }

  async function handleScreeningDelete(screening) {
    if (
      !window.confirm(
        'Supprimer la séance du film « ' +
          screening.fi_title +
          ' » du ' +
          formatDate(screening.sc_datetime) +
          ' ?'
      )
    ) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    try {
      await screeningsServices.deleteScreening(screening.sc_id)
      setSuccessMessage('Séance supprimée.')
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de supprimer cette séance.'))
    }
  }

  function handleScreeningFormChange(event) {
    const { name, value } = event.target
    setScreeningForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreateScreeningSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const filmId = Number(screeningForm.film)
    const roomId = Number(screeningForm.room)
    const priceValue = Number(screeningForm.price)
    const datetime = screeningForm.datetime

    if (!filmId || !roomId || !datetime || Number.isNaN(priceValue) || priceValue < 0) {
      setErrorMessage('Veuillez renseigner un film, une salle, une date/heure et un tarif valide.')
      return
    }

    setIsCreatingScreening(true)
    try {
      await screeningsServices.insert({
        film: filmId,
        room: roomId,
        datetime: datetime,
        price: priceValue,
      })
      setSuccessMessage('Séance ajoutée.')
      setScreeningForm({ film: '', room: '', datetime: '', price: '' })
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible d'ajouter cette séance."))
    } finally {
      setIsCreatingScreening(false)
    }
  }

  function handleRoomChange(event) {
    setRoomForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleRoomSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const name = roomForm.name.trim()
    const capacity = Number(roomForm.capacity)
    if (!name || !Number.isInteger(capacity) || capacity < 1) {
      setErrorMessage('Saisissez un nom de salle et une capacité entière positive.')
      return
    }

    setIsSavingRoom(true)
    try {
      await roomsServices.create({ name, capacity })
      setRoomForm(emptyRoom)
      setSuccessMessage('Salle créée.')
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de créer cette salle.'))
    } finally {
      setIsSavingRoom(false)
    }
  }

  async function handleReservationCancel(reservation) {
    if (!window.confirm('Annuler la réservation de ' + reservation.us_username + ' pour « ' + reservation.fi_title + ' » ?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setCancellingReservationId(reservation.re_id)
    try {
      await reservationsServices.cancel(reservation.re_id)
      setReservations((current) => current.filter((item) => item.re_id !== reservation.re_id))
      setSuccessMessage('Réservation annulée.')
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible d’annuler cette réservation.'))
    } finally {
      setCancellingReservationId(null)
    }
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

  async function handleUserSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const userData = { username: user.username, email: user.email }
    try {
      await usersServices.update(selectedUser.us_id, userData)
      setSuccessMessage('Compte modifié.')
      setSelectedUser(null)
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de modifier ce compte.'))
    }
  }

  async function handleUserDelete(selected) {
    if (!window.confirm('Supprimer le compte de ' + selected.us_username + ' ?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    try {
      await usersServices.remove(selected.us_id)
      setSuccessMessage('Compte supprimé.')
      if (selectedUser && selectedUser.us_id === selected.us_id) {
        setSelectedUser(null)
      }
      refreshSection()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Impossible de supprimer ce compte.'))
    }
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
            className={'btn ' + (activeSection === 'rooms' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => changeSection('rooms')}
          >
            Salles
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
                  <div className="col-12">
                    <label className="form-label" htmlFor="filmImage">Affiche du film</label>
                    <input
                      ref={filmImageInput}
                      className="form-control"
                      id="filmImage"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFilmImageChange}
                    />
                    <div className="form-text">JPG, PNG ou WEBP, 5 Mo maximum. Laissez vide pour conserver l’affiche actuelle.</div>
                    {editingFilm && editingFilm.fi_image && (
                      <div className="d-flex align-items-center gap-3 mt-3">
                        <img
                          className="film-admin-preview"
                          src={getFilmImageUrl(editingFilm.fi_image)}
                          alt={'Affiche actuelle de ' + editingFilm.fi_title}
                        />
                        <span className="text-muted">Affiche actuelle</span>
                      </div>
                    )}
                    {filmImage && <p className="text-muted mt-2 mb-0">{filmImage.name}</p>}
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
                      <th scope="col">Affiche</th>
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
                        <td>
                          {item.fi_image
                            ? <img className="film-admin-thumbnail" src={getFilmImageUrl(item.fi_image)} alt={'Affiche de ' + item.fi_title} />
                            : '—'}
                        </td>
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

            <div className="card mb-4">
              <div className="card-body">
                <h3 className="h5">Ajouter une séance</h3>
                <form className="row g-3 align-items-end" onSubmit={handleCreateScreeningSubmit}>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="newScreeningFilm">
                      Film
                    </label>
                    <select
                      className="form-select"
                      id="newScreeningFilm"
                      name="film"
                      value={screeningForm.film}
                      onChange={handleScreeningFormChange}
                      required
                    >
                      <option value="">Choisir un film...</option>
                      {films.map((f) => (
                        <option key={f.fi_id} value={f.fi_id}>
                          {f.fi_title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="newScreeningRoom">
                      Salle
                    </label>
                    <select
                      className="form-select"
                      id="newScreeningRoom"
                      name="room"
                      value={screeningForm.room}
                      onChange={handleScreeningFormChange}
                      required
                    >
                      <option value="">Choisir une salle...</option>
                      {rooms.map((r) => (
                        <option key={r.ro_id} value={r.ro_id}>
                          {r.ro_name} ({r.ro_capacity} places)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="newScreeningDatetime">
                      Date et heure
                    </label>
                    <input
                      className="form-control"
                      id="newScreeningDatetime"
                      name="datetime"
                      type="datetime-local"
                      value={screeningForm.datetime}
                      onChange={handleScreeningFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label" htmlFor="newScreeningPrice">
                      Tarif (€)
                    </label>
                    <input
                      className="form-control"
                      id="newScreeningPrice"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="9.50"
                      value={screeningForm.price}
                      onChange={handleScreeningFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-1">
                    <button className="btn btn-primary w-100" type="submit" disabled={isCreatingScreening}>
                      {isCreatingScreening ? '...' : 'Ajouter'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

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
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {screenings.map((screening) => {
                      const isEditing = editingScreening && editingScreening.sc_id === screening.sc_id
                      return (
                        <tr key={screening.sc_id}>
                          <td>{screening.fi_title}</td>
                          <td>{formatDate(screening.sc_datetime)}</td>
                          <td>
                            {isEditing ? (
                              <select
                                className="form-select form-select-sm"
                                id={'screeningRoom-' + screening.sc_id}
                                value={roomId}
                                onChange={(event) => setRoomId(event.target.value)}
                                required
                              >
                                {rooms.map((room) => (
                                  <option key={room.ro_id} value={room.ro_id}>
                                    {room.ro_name} ({room.ro_capacity} places)
                                  </option>
                                ))}
                              </select>
                            ) : (
                              screening.ro_name
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <div className="input-group input-group-sm">
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
                                <span className="input-group-text">€</span>
                              </div>
                            ) : (
                              Number(screening.sc_price).toFixed(2) + ' €'
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-primary"
                                  type="button"
                                  onClick={() => handleScreeningSubmit(screening)}
                                  disabled={isSavingScreening}
                                >
                                  {isSavingScreening ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  onClick={() => setEditingScreening(null)}
                                  disabled={isSavingScreening}
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  type="button"
                                  onClick={() => startEditingScreening(screening)}
                                >
                                  Modifier la salle
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  type="button"
                                  onClick={() => handleScreeningDelete(screening)}
                                >
                                  Supprimer
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeSection === 'rooms' && (
          <section>
            <h2 className="h3 mb-4">Gestion des salles</h2>

            <div className="card mb-4">
              <div className="card-body">
                <h3 className="h5">Créer une salle</h3>
                <form className="row g-3 align-items-end" onSubmit={handleRoomSubmit}>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="roomName">Nom de la salle</label>
                    <input
                      className="form-control"
                      id="roomName"
                      name="name"
                      value={roomForm.name}
                      onChange={handleRoomChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="roomCapacity">Capacité</label>
                    <input
                      className="form-control"
                      id="roomCapacity"
                      name="capacity"
                      type="number"
                      min="1"
                      step="1"
                      value={roomForm.capacity}
                      onChange={handleRoomChange}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-primary" type="submit" disabled={isSavingRoom}>
                      {isSavingRoom ? 'Création...' : 'Créer la salle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {isLoading ? (
              <p className="text-muted">Chargement des salles...</p>
            ) : rooms.length === 0 ? (
              <div className="alert alert-info" role="status">Aucune salle pour le moment.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped align-middle">
                  <thead>
                    <tr>
                      <th scope="col">Salle</th>
                      <th scope="col">Capacité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room.ro_id}>
                        <td>{room.ro_name}</td>
                        <td>{room.ro_capacity} places</td>
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
