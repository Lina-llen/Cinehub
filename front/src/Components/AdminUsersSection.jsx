import { useEffect, useState } from 'react'
import usersServices from '../Services/usersServices.js'

function AdminUsersSection() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [user, setUser] = useState({ username: '', email: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  function loadUsers() {
    usersServices.getAll()
      .then((response) => {
        setUsers(response.data)
        setIsLoading(false)
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de récupérer les utilisateurs.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    loadUsers()
  }, [])

  function startEditing(selected) {
    setSelectedUser(selected)
    setUser({ username: selected.us_username, email: selected.us_email })
    setErrorMessage('')
    setSuccessMessage('')
  }

  function handleChange(event) {
    setUser({ ...user, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const userData = { username: user.username, email: user.email }

    usersServices.update(selectedUser.us_id, userData)
      .then(() => {
        setSuccessMessage('Compte modifié.')
        setSelectedUser(null)
        loadUsers()
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || "Impossible de modifier ce compte.")
      })
  }

  function handleDelete(selected) {
    if (!window.confirm('Supprimer le compte de ' + selected.us_username + ' ?')) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    usersServices.remove(selected.us_id)
      .then(() => {
        setSuccessMessage('Compte supprimé.')
        if (selectedUser && selectedUser.us_id === selected.us_id) {
          setSelectedUser(null)
        }
        loadUsers()
      })
      .catch((error) => {
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de supprimer ce compte.')
      })
  }

  return (
    <section>
      <h2 className="h3 mb-4">Gestion des utilisateurs</h2>

      {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success" role="status">{successMessage}</div>}

      {selectedUser && (
        <div className="card mb-4">
          <div className="card-body">
            <h3 className="h5">Modifier le compte de {selectedUser.us_username}</h3>
            <form className="row g-3" onSubmit={handleSubmit}>
              <div className="col-md-6">
                <label className="form-label" htmlFor="userUsername">Nom d’utilisateur</label>
                <input className="form-control" id="userUsername" name="username" value={user.username} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label" htmlFor="userEmail">Adresse e-mail</label>
                <input className="form-control" id="userEmail" name="email" type="email" value={user.email} onChange={handleChange} required />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit">Enregistrer</button>
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSelectedUser(null)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted">Chargement des utilisateurs...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th scope="col">Nom d’utilisateur</th>
                <th scope="col">E-mail</th>
                <th scope="col">Rôle</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.us_id}>
                  <td>{item.us_username}</td>
                  <td>{item.us_email}</td>
                  <td>{item.us_role}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEditing(item)}>
                        Modifier
                      </button>
                      <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDelete(item)}>
                        Supprimer
                      </button>
                    </div>
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

export default AdminUsersSection
