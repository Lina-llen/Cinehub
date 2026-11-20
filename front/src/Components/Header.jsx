import { Link, useNavigate } from 'react-router'
import authServices from '../Services/authServices.js'

function Header() {
  const user = authServices.getUser()
  const navigate = useNavigate()

  function handleLogout() {
    authServices.logout()
    navigate('/')
  }

  return (
    <header className="border-bottom">
      <nav className="navbar container py-3">
      <Link className="navbar-brand brand-mark" to="/" aria-label="CineHub - Accueil">
        <span className="brand-mark__frame" aria-hidden="true"></span>
        <span>CINE<span className="brand-mark__accent">HUB</span></span>
        <span className="brand-mark__rec" aria-hidden="true"></span>
        </Link>

        <div className="ms-auto d-flex gap-2">
          {user ? (
            <>
              <Link className="btn btn-link" to="/films">
                Films
              </Link>
              {user.us_role === 'admin' && (
                <Link className="btn btn-link" to="/admin">
                  Administration
                </Link>
              )}
              <Link className="btn btn-outline-primary rounded-circle p-2 d-inline-flex align-items-center justify-content-center" to="/profil" aria-label="Accéder à mon profil">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20c0-3.5 2.8-6 7-6s7 2.5 7 6" />
                </svg>
              </Link>
              <button className="btn btn-outline-primary" type="button" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline-primary" to="/connexion">
                Connexion
              </Link>
              <Link className="btn btn-primary" to="/inscription">
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
