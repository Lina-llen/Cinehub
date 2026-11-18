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

  return (
    <div>
      <Header />
      <main className="container py-5">
        <p><Link to="/profil">Retour au profil</Link></p>
        <h1 className="display-5 fw-bold mb-4">Mes réservations</h1>

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
          <div className="list-group">
            {reservations.map((reservation) => (
              <article className="list-group-item" key={reservation.re_id}>
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
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default ReservationsPage
