import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import HomePage from './Pages/HomePage.jsx'
import LoginPage from './Pages/LoginPage.jsx'
import RegisterPage from './Pages/RegisterPage.jsx'
import ProfilePage from './Pages/ProfilePage.jsx'
import FilmsPage from './Pages/FilmsPage.jsx'
import FilmDetailPage from './Pages/FilmDetailPage.jsx'
import ReservationsPage from './Pages/ReservationsPage.jsx'
import AdminPage from './Pages/AdminPage.jsx'
import ComingSoonPage from './Pages/ComingSoonPage.jsx'
import ProtectedRoute from './Wrappers/ProtectedRoute.jsx'
import AdminRoute from './Wrappers/AdminRoute.jsx'

const CalendarPage = lazy(() => import('./Pages/CalendarPage.jsx'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/films" element={<ProtectedRoute><FilmsPage /></ProtectedRoute>} />
        <Route path="/films/:id" element={<ProtectedRoute><FilmDetailPage /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />
        <Route
          path="/calendrier"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="container py-5" role="status">Chargement du calendrier...</div>}>
                <CalendarPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<ComingSoonPage title="Page introuvable" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
