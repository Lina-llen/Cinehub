import { Link } from 'react-router'
import Header from '../Components/Header.jsx'
import authServices from '../Services/authServices.js'

function HomePage() {
  const isConnected = authServices.isConnected()

  return (
    <div>
      <Header />

      <main className="container py-5">
        <div className="row align-items-center g-4">
          <section className="col-lg-7 home-hero">
            <p className="text-uppercase text-secondary small fw-semibold home-hero__eyebrow">Le cinéma, à votre rythme</p>
            <h1 className="display-3 fw-bold">
              La prochaine séance commence ici.
            </h1>
            <p className="lead text-secondary my-4">
              Retrouvez les films à l’affiche, choisissez votre séance et
              réservez vos places en quelques clics.
            </p>
            <div className="d-flex flex-wrap gap-3">
              {isConnected ? (
                <Link className="btn btn-primary btn-lg" to="/films">
                  Voir les films
                </Link>
              ) : (
                <>
                  <Link className="btn btn-primary btn-lg" to="/connexion">
                    Connexion
                  </Link>
                  <Link className="btn btn-outline-primary btn-lg" to="/inscription">
                    Créer un compte
                  </Link>
                </>
              )}
            </div>
          </section>

          <aside className="col-lg-5" aria-label="Bienvenue chez CineHub">
            <div className="card home-feature-card">
              <div className="card-body p-4">
                <h2 className="h5 card-title">Bienvenue chez CineHub</h2>
                <p className="card-text text-secondary">
                  Retrouvez vos films, choisissez une séance et gérez vos réservations.
                </p>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0">Films à l’affiche</li>
                  <li className="list-group-item px-0">Séances disponibles</li>
                  <li className="list-group-item px-0">Réservations en ligne</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="container py-3 border-top text-secondary">
        CineHub — Le cinéma, simplement.
      </footer>
    </div>
  )
}

export default HomePage
