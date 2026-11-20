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
  const [successMessage, setSuccessMessage] = useState('')
  const [cancellingReservationId, setCancellingReservationId] = useState(null)

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

  function handleCancel(reservation) {
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
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible d’annuler cette réservation.')
      })
      .finally(() => setCancellingReservationId(null))
  }

  return (
    <section>
      <h2 className="h3 mb-4">Toutes les réservations</h2>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success" role="status">{successMessage}</div>}
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
                      onClick={() => handleCancel(reservation)}
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
  )
}

export default AdminReservationsSection
