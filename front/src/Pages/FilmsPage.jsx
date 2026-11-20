import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Header from '../Components/Header.jsx'
import filmsServices, { getFilmImageUrl } from '../Services/filmsServices.js'

function FilmsPage() {
  const [films, setFilms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadFilms() {
      try {
        const response = await filmsServices.getShowing()
        if (!isCurrent) {
          return
        }
        setFilms(response.data)
      } catch (error) {
        if (!isCurrent) {
          return
        }
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || "Impossible de récupérer les films à l'affiche.")
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadFilms()
    return () => {
      isCurrent = false
    }
  }, [])

  return (
    <div>
      <Header />
      <main className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <h1 className="display-5 fw-bold mb-0">Films à l’affiche</h1>
          <Link className="btn btn-outline-primary" to="/calendrier">
            Voir le calendrier des séances
          </Link>
        </div>

        {isLoading && <p className="text-muted">Chargement des films...</p>}

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && films.length === 0 && (
          <div className="alert alert-info" role="status">
            Aucun film n’est actuellement à l’affiche.
          </div>
        )}

        {!errorMessage && films.length > 0 && (
          <div className="list-group film-list">
            {films.map((film) => (
              <div className="list-group-item film-list__item d-flex flex-wrap align-items-center justify-content-between gap-3" key={film.fi_id}>
                <div className="d-flex align-items-center gap-3">
                  {film.fi_image && (
                    <img
                      className="film-list__poster"
                      src={getFilmImageUrl(film.fi_image)}
                      alt={'Affiche de ' + film.fi_title}
                    />
                  )}
                  <div>
                    <h2 className="h5 mb-1">{film.fi_title}</h2>
                    <p className="mb-0 text-muted">{film.fi_genre || 'Genre non renseigné'}</p>
                  </div>
                </div>
                <Link className="btn btn-primary" to={'/films/' + film.fi_id}>
                  Détails
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default FilmsPage
