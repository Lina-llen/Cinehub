import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Header from '../Components/Header.jsx'
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

function ReservationsPage() {
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cancellingReservationId, setCancellingReservationId] = useState(null)

  useEffect(() => {
    reservationsServices.getMine()
      .then((response) => {
        setReservations(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer vos réservations.')
        setIsLoading(false)
      })
  }, [])

  function handleCancel(reservation) {
    if (!window.confirm('Annuler votre réservation pour « ' + reservation.fi_title + ' » ?')) {
      return
    }

    setErrorMessage('')
    setCancellingReservationId(reservation.re_id)
    reservationsServices.cancel(reservation.re_id)
      .then(() => {
        setReservations((current) => current.filter((item) => item.re_id !== reservation.re_id))
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible d’annuler cette réservation.')
      })
      .finally(() => setCancellingReservationId(null))
  }

  return (
    <div>
      <Header />
      <main className="container py-5">
        <p><Link to="/profil">Retour au profil</Link></p>
        <h1 className="display-5 fw-bold mb-4">Mes réservations</h1>
        <p><Link className="btn btn-outline-primary mb-4" to="/calendrier">Voir les séances dans le calendrier</Link></p>

        {isLoading && <p className="text-muted">Chargement des réservations...</p>}

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && reservations.length === 0 && (
          <div className="alert alert-info" role="status">
            Vous n’avez pas encore de réservation.
          </div>
        )}

        {!errorMessage && reservations.length > 0 && (
          <div className="list-group reservation-list">
            {reservations.map((reservation) => (
              <article className="list-group-item reservation-ticket" key={reservation.re_id}>
                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                  <h2 className="h5 mb-0">{reservation.fi_title}</h2>
                  <span className="text-muted">Réservation #{reservation.re_id}</span>
                </div>
                <div className="row g-2">
                  <p className="col-md-6 mb-0">
                    <strong>Séance :</strong> {formatDate(reservation.sc_datetime)}
                  </p>
                  <p className="col-md-6 mb-0">
                    <strong>Salle :</strong> {reservation.ro_name}
                  </p>
                  <p className="col-md-6 mb-0">
                    <strong>Places :</strong> {reservation.re_seats}
                  </p>
                  <p className="col-md-6 mb-0">
                    <strong>Prix par place :</strong> {Number(reservation.sc_price).toFixed(2)} €
                  </p>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm mt-3"
                  type="button"
                  disabled={cancellingReservationId === reservation.re_id}
                  onClick={() => handleCancel(reservation)}
                >
                  {cancellingReservationId === reservation.re_id ? 'Annulation...' : 'Annuler la réservation'}
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ReservationsPage
