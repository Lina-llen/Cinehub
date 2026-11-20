import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import Header from '../Components/Header.jsx'
import authServices from '../Services/authServices.js'

function LoginPage() {
  const [user, setUser] = useState({ username: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    authServices.login(user)
      .then(() => {
        const destination = location.state && location.state.from
          ? location.state.from.pathname
          : '/'
        navigate(destination)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de se connecter. Vérifiez le serveur et réessayez.')
      })
  }

  return (
    <div>
      <Header />
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 col-xl-5">
            <div className="card auth-card">
              <div className="card-body p-4">
                <h1 className="h2">Connexion</h1>
                <p className="text-secondary">Connectez-vous pour retrouver vos séances.</p>

                {location.state && location.state.message && (
                  <div className="alert alert-success" role="status">
                    {location.state.message}
                  </div>
                )}

                {errorMessage && (
                  <div className="alert alert-danger" role="alert">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="username">Nom d’utilisateur</label>
                    <input
                      className="form-control"
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      value={user.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label" htmlFor="password">Mot de passe</label>
                    <input
                      className="form-control"
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={user.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button className="btn btn-primary w-100" type="submit">
                    Se connecter
                  </button>
                </form>

                <p className="mt-4 mb-0 text-center">
                  Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
