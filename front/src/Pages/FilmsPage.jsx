import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Header from '../Components/Header.jsx'
import filmsServices from '../Services/filmsServices.js'

function FilmsPage() {
  const [films, setFilms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    filmsServices.getShowing()
      .then((response) => {
        setFilms(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || "Impossible de récupérer les films à l'affiche.")
        setIsLoading(false)
      })
  }, [])

  return (
    <div>
      <Header />
      <main className="container py-5">
        <h1 className="display-5 fw-bold mb-4">Films à l’affiche</h1>

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
          <div className="list-group">
            {films.map((film) => (
              <div className="list-group-item d-flex flex-wrap align-items-center justify-content-between gap-3" key={film.fi_id}>
                <div>
                  <h2 className="h5 mb-1">{film.fi_title}</h2>
                  <p className="mb-0 text-muted">{film.fi_genre || 'Genre non renseigné'}</p>
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
