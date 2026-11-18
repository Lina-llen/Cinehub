import { useEffect, useState } from 'react'
import screeningsServices from '../Services/screeningsServices.js'

function formatDate(value) {
  if (!value) {
    return ''
  }
  return new Date(value).toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
}

function AdminScreeningsSection() {
  const [screenings, setScreenings] = useState([])
  const [editingScreening, setEditingScreening] = useState(null)
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function loadScreenings() {
    screeningsServices.getAll()
      .then((response) => {
        setScreenings(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer les séances.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadScreenings()
  }, [])

  function startEditing(screening) {
    setEditingScreening(screening)
    setPrice(String(screening.sc_price))
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleSubmit(event, screening) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    screeningsServices.update(screening.sc_id, { price: Number(price) })
      .then(() => {
        setSuccessMessage('Prix de la séance modifié.')
        setEditingScreening(null)
        loadScreenings()
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de modifier le prix de cette séance.')
      })
  }

  return (
    <section>
      <h2 className="h3 mb-4">Gestion des séances</h2>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success" role="status">{successMessage}</div>}

      {isLoading ? (
        <p className="text-muted">Chargement des séances...</p>
      ) : screenings.length === 0 ? (
        <div className="alert alert-info" role="status">Aucune séance pour le moment.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Film</th>
                <th scope="col">Date</th>
                <th scope="col">Salle</th>
                <th scope="col">Prix</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {screenings.map((screening) => (
                <tr key={screening.sc_id}>
                  <td>{screening.fi_title}</td>
                  <td>{formatDate(screening.sc_datetime)}</td>
                  <td>{screening.ro_name}</td>
                  <td>
                    {editingScreening && editingScreening.sc_id === screening.sc_id ? (
                      <form
                        className="d-flex align-items-center gap-2"
                        onSubmit={(event) => handleSubmit(event, screening)}
                      >
                        <label className="visually-hidden" htmlFor={'screeningPrice-' + screening.sc_id}>
                          Prix en euros
                        </label>
                        <input
                          className="form-control"
                          id={'screeningPrice-' + screening.sc_id}
                          type="number"
                          min="0"
                          step="0.01"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                          required
                        />
                        <span>€</span>
                        <button className="btn btn-sm btn-primary" type="submit">Enregistrer</button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          type="button"
                          onClick={() => setEditingScreening(null)}
                        >
                          Annuler
                        </button>
                      </form>
                    ) : (
                      Number(screening.sc_price).toFixed(2) + ' €'
                    )}
                  </td>
                  <td>
                    {(!editingScreening || editingScreening.sc_id !== screening.sc_id) && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        type="button"
                        onClick={() => startEditing(screening)}
                      >
                        Modifier le prix
                      </button>
                    )}
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

export default AdminScreeningsSection
