import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Header from '../Components/Header.jsx'
import authServices from '../Services/authServices.js'
import reservationsServices from '../Services/reservationsServices.js'
import usersServices from '../Services/usersServices.js'

function ProfilePage() {
  const [user, setUser] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [reservationCount, setReservationCount] = useState(0)
  const [reservationError, setReservationError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    usersServices.getMe()
      .then((response) => {
        setUser(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer votre profil.')
        setIsLoading(false)
      })

    reservationsServices.getMine()
      .then((response) => setReservationCount(response.data.length))
      .catch(() => setReservationError('Impossible de récupérer le nombre de réservations.'))
  }, [])

  function handleLogout() {
    authServices.logout()
    navigate('/')
  }

  return (
    <div>
      <Header />
      <main className="container py-5">
        <div className="mb-4">
          <h1 className="display-5 fw-bold">Mon profil</h1>
          <p className="text-muted">Vos informations et votre activité sur CineHub.</p>
        </div>

        {isLoading && <p className="text-muted">Chargement de votre profil...</p>}

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
            <div className="mt-2">
              <Link to="/connexion">Se connecter</Link>
            </div>
          </div>
        )}

        {user && (
          <div className="row g-4">
            <section className="col-lg-7">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h4 mb-4">Mes informations</h2>
                  <dl className="row mb-0">
                    <dt className="col-sm-4">Nom d’utilisateur</dt>
                    <dd className="col-sm-8">{user.us_username}</dd>
                    <dt className="col-sm-4">Adresse e-mail</dt>
                    <dd className="col-sm-8">{user.us_email}</dd>
                  </dl>
                </div>
              </div>
            </section>

            <section className="col-lg-5">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h4 mb-3">Mes réservations</h2>
                  <p className="display-4 fw-bold mb-3">{reservationCount}</p>
                  {reservationError && <p className="text-danger">{reservationError}</p>}
                  <Link className="btn btn-primary me-2" to="/reservations">
                    Consulter mes réservations
                  </Link>
                  <button className="btn btn-outline-primary" type="button" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default ProfilePage
