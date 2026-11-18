import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Header from '../Components/Header.jsx'
import filmsServices from '../Services/filmsServices.js'
import reservationsServices from '../Services/reservationsServices.js'

function formatDate(value) {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

function FilmDetailPage() {
  const { id } = useParams()
  const [film, setFilm] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedScreening, setSelectedScreening] = useState(null)
  const [seats, setSeats] = useState(1)
  const [bookingError, setBookingError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  useEffect(() => {
    filmsServices.getById(id)
      .then((response) => {
        setFilm(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer ce film.')
        setIsLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!selectedScreening) {
      return
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isBooking) {
        setSelectedScreening(null)
      }
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedScreening, isBooking])

  function openBooking(screening) {
    setSelectedScreening(screening)
    setSeats(1)
    setBookingError('')
    setSuccessMessage('')
  }

  function handleReservation(event) {
    event.preventDefault()
    setBookingError('')
    setIsBooking(true)

    reservationsServices.create(selectedScreening.sc_id, Number(seats))
      .then(() => {
        setSuccessMessage('Votre réservation a bien été enregistrée.')
        setSelectedScreening(null)
        setIsBooking(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setBookingError(message || "Impossible d'effectuer la réservation.")
        setIsBooking(false)
      })
  }

  const totalPrice = selectedScreening
    ? Number(selectedScreening.sc_price) * Number(seats)
    : 0

  return (
    <div>
      <Header />
      <main className="container py-5">
        <p><Link to="/films">Retour aux films</Link></p>

        {successMessage && (
          <div className="alert alert-success d-flex flex-wrap align-items-center justify-content-between gap-2" role="status">
            <span>{successMessage}</span>
            <Link to="/reservations">Voir mes réservations</Link>
          </div>
        )}

        {isLoading && <p className="text-muted">Chargement du film...</p>}

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        {film && (
          <>
            <section className="mb-5">
              <h1 className="display-5 fw-bold">{film.fi_title}</h1>
              {film.fi_genre && <p className="text-muted">{film.fi_genre}</p>}
              {film.fi_description && <p className="lead">{film.fi_description}</p>}
              <p><strong>Durée :</strong> {film.fi_duration} minutes</p>
            </section>

            <section>
              <h2 className="h3 mb-3">Prochaines séances</h2>
              {film.screenings.length === 0 ? (
                <div className="alert alert-info" role="status">
                  Aucune séance à venir pour ce film.
                </div>
              ) : (
                <div className="list-group">
                  {film.screenings.map((screening) => (
                    <div className="list-group-item" key={screening.sc_id}>
                      <div className="row align-items-center g-2">
                        <div className="col-md-5">
                          <strong>{formatDate(screening.sc_datetime)}</strong>
                        </div>
                        <div className="col-md-4">
                          Salle : {screening.ro_name}
                        </div>
                        <div className="col-md-3">
                          Prix : {Number(screening.sc_price).toFixed(2)} €
                        </div>
                        <div className="col-12">
                          <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => openBooking(screening)}
                          >
                            Réserver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {selectedScreening && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bookingModalTitle"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleReservation}>
                  <div className="modal-header">
                    <h2 className="modal-title fs-5" id="bookingModalTitle">
                      Réserver une séance
                    </h2>
                    <button
                      className="btn-close"
                      type="button"
                      aria-label="Fermer"
                      onClick={() => setSelectedScreening(null)}
                      disabled={isBooking}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>{film && film.fi_title}</strong></p>
                    <p>{formatDate(selectedScreening.sc_datetime)} — Salle {selectedScreening.ro_name}</p>
                    <p>Prix par place : {Number(selectedScreening.sc_price).toFixed(2)} €</p>

                    {bookingError && (
                      <div className="alert alert-danger" role="alert">
                        {bookingError}
                      </div>
                    )}

                    <label className="form-label" htmlFor="reservationSeats">Nombre de places</label>
                    <input
                      className="form-control"
                      id="reservationSeats"
                      type="number"
                      min="1"
                      step="1"
                      value={seats}
                      onChange={(event) => setSeats(event.target.value)}
                      required
                      autoFocus
                    />
                    <p className="mt-3 mb-0">
                      Total : <strong>{totalPrice.toFixed(2)} €</strong>
                    </p>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setSelectedScreening(null)}
                      disabled={isBooking}
                    >
                      Annuler
                    </button>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isBooking || !Number.isInteger(Number(seats)) || Number(seats) < 1}
                    >
                      {isBooking ? 'Réservation...' : 'Confirmer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default FilmDetailPage
