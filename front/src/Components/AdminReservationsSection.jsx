import { useEffect, useState } from 'react'
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

function AdminReservationsSection() {
  const [reservations, setReservations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    reservationsServices.getAll()
      .then((response) => {
        setReservations(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer les réservations.')
        setIsLoading(false)
      })
  }, [])

  return (
    <section>
      <h2 className="h3 mb-4">Toutes les réservations</h2>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminReservationsSection
