import { useState } from 'react'
import Header from '../Components/Header.jsx'
import AdminFilmsSection from '../Components/AdminFilmsSection.jsx'
import AdminUsersSection from '../Components/AdminUsersSection.jsx'
import AdminReservationsSection from '../Components/AdminReservationsSection.jsx'
import AdminScreeningsSection from '../Components/AdminScreeningsSection.jsx'

function AdminPage() {
  const [activeSection, setActiveSection] = useState('films')

  return (
    <div>
      <Header />
      <main className="container py-5">
        <h1 className="display-5 fw-bold mb-4">Administration</h1>

        <nav className="nav nav-pills gap-2 mb-4" aria-label="Sections d’administration">
          <button
            className={'btn ' + (activeSection === 'films' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => setActiveSection('films')}
          >
            Films
          </button>
          <button
            className={'btn ' + (activeSection === 'users' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => setActiveSection('users')}
          >
            Utilisateurs
          </button>
          <button
            className={'btn ' + (activeSection === 'screenings' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => setActiveSection('screenings')}
          >
            Séances
          </button>
          <button
            className={'btn ' + (activeSection === 'reservations' ? 'btn-primary' : 'btn-outline-primary')}
            type="button"
            onClick={() => setActiveSection('reservations')}
          >
            Réservations
          </button>
        </nav>

        {activeSection === 'films' && <AdminFilmsSection />}
        {activeSection === 'users' && <AdminUsersSection />}
        {activeSection === 'screenings' && <AdminScreeningsSection />}
        {activeSection === 'reservations' && <AdminReservationsSection />}
      </main>
    </div>
  )
}

export default AdminPage
