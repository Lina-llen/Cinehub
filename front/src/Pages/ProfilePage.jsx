import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Header from '../Components/Header.jsx'
import reservationsServices from '../Services/reservationsServices.js'
import usersServices from '../Services/usersServices.js'

function ProfilePage() {
  const [user, setUser] = useState(null)
  const [profileForm, setProfileForm] = useState({ username: '', email: '' })
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileErrorMessage, setProfileErrorMessage] = useState('')
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('')
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('')
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [reservationCount, setReservationCount] = useState(0)
  const [reservationError, setReservationError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    usersServices.getMe()
      .then((response) => {
        setUser(response.data)
        setProfileForm({ username: response.data.us_username, email: response.data.us_email })
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

  function handleProfileChange(event) {
    setProfileForm({ ...profileForm, [event.target.name]: event.target.value })
  }

  function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileErrorMessage('')
    setProfileSuccessMessage('')
    setIsSavingProfile(true)

    usersServices.update(user.us_id, profileForm)
      .then((response) => {
        setUser(response.data.user)
        setProfileForm({
          username: response.data.user.us_username,
          email: response.data.user.us_email,
        })
        setIsEditingProfile(false)
        setProfileSuccessMessage('Votre profil a été mis à jour.')
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setProfileErrorMessage(message || 'Impossible de modifier votre profil.')
      })
      .finally(() => setIsSavingProfile(false))
  }

  function cancelProfileEdit() {
    setProfileForm({ username: user.us_username, email: user.us_email })
    setProfileErrorMessage('')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordErrorMessage('')
    setPasswordSuccessMessage('')
    setIsEditingProfile(false)
  }

  function handlePasswordChange(event) {
    setPasswordForm({ ...passwordForm, [event.target.name]: event.target.value })
  }

  function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordErrorMessage('')
    setPasswordSuccessMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrorMessage('La confirmation du nouveau mot de passe ne correspond pas.')
      return
    }

    setIsSavingPassword(true)
    usersServices.changeMyPassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    })
      .then(() => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setPasswordSuccessMessage('Votre mot de passe a été modifié.')
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setPasswordErrorMessage(message || 'Impossible de modifier votre mot de passe.')
      })
      .finally(() => setIsSavingPassword(false))
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
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <h2 className="h4 mb-0">Mes informations</h2>
                    {!isEditingProfile && (
                      <button className="btn btn-outline-primary" type="button" onClick={() => setIsEditingProfile(true)}>
                        Modifier mon profil
                      </button>
                    )}
                  </div>

                  {profileErrorMessage && <div className="alert alert-danger" role="alert">{profileErrorMessage}</div>}
                  {profileSuccessMessage && <div className="alert alert-success" role="status">{profileSuccessMessage}</div>}

                  {isEditingProfile && (
                    <form className="row g-3" onSubmit={handleProfileSubmit}>
                      <div className="col-12">
                        <label className="form-label" htmlFor="profileUsername">Nom d’utilisateur</label>
                        <input
                          className="form-control"
                          id="profileUsername"
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" htmlFor="profileEmail">Adresse e-mail</label>
                        <input
                          className="form-control"
                          id="profileEmail"
                          name="email"
                          type="email"
                          value={profileForm.email}
                          onChange={handleProfileChange}
                          required
                        />
                      </div>
                      <div className="col-12 d-flex gap-2">
                        <button className="btn btn-primary" type="submit" disabled={isSavingProfile}>
                          {isSavingProfile ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                        <button className="btn btn-outline-secondary" type="button" onClick={cancelProfileEdit} disabled={isSavingProfile}>
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}

                  {isEditingProfile && user.us_role === 'user' && (
                    <section className="border-top mt-4 pt-4">
                      <h3 className="h5 mb-3">Changer mon mot de passe</h3>
                      {passwordErrorMessage && <div className="alert alert-danger" role="alert">{passwordErrorMessage}</div>}
                      {passwordSuccessMessage && <div className="alert alert-success" role="status">{passwordSuccessMessage}</div>}
                      <form className="row g-3" onSubmit={handlePasswordSubmit}>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="currentPassword">Mot de passe actuel</label>
                          <input
                            className="form-control"
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            autoComplete="current-password"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="newPassword">Nouveau mot de passe</label>
                          <input
                            className="form-control"
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label" htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                          <input
                            className="form-control"
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                          />
                        </div>
                        <div className="col-12">
                          <button className="btn btn-outline-primary" type="submit" disabled={isSavingPassword}>
                            {isSavingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                  {isEditingProfile && user.us_role === 'admin' && (
                    <p className="text-muted border-top mt-4 pt-4 mb-0">
                      La modification du mot de passe n’est pas disponible pour les comptes administrateur.
                    </p>
                  )}

                  {!isEditingProfile && (
                    <dl className="row mb-0">
                      <dt className="col-sm-4">Nom d’utilisateur</dt>
                      <dd className="col-sm-8">{user.us_username}</dd>
                      <dt className="col-sm-4">Adresse e-mail</dt>
                      <dd className="col-sm-8">{user.us_email}</dd>
                    </dl>
                  )}
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
                  <Link className="btn btn-outline-primary me-2" to="/calendrier">
                    Voir le calendrier
                  </Link>
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
