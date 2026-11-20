import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Header from '../Components/Header.jsx'
import authServices from '../Services/authServices.js'

function RegisterPage() {
  const [user, setUser] = useState({ username: '', email: '', password: '' })
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    authServices.register(user)
      .then(() => navigate('/connexion', {
        state: { message: 'Votre compte a bien été créé. Vous pouvez vous connecter.' },
      }))
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de créer le compte. Vérifiez le serveur et réessayez.')
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
                <h1 className="h2">Inscription</h1>
                <p className="text-secondary">Créez votre compte pour préparer votre prochaine séance.</p>

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

                  <div className="mb-3">
                    <label className="form-label" htmlFor="email">Adresse e-mail</label>
                    <input
                      className="form-control"
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={user.email}
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
                      autoComplete="new-password"
                      value={user.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button className="btn btn-primary w-100" type="submit">
                    Créer mon compte
                  </button>
                </form>

                <p className="mt-4 mb-0 text-center">
                  Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage
