import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import AuthContext from './Contexts/AuthContext.jsx'
import authServices from './Services/authServices.js'
import HomePage from './Pages/HomePage.jsx'
import LoginPage from './Pages/LoginPage.jsx'
import RegisterPage from './Pages/RegisterPage.jsx'
import ProfilePage from './Pages/ProfilePage.jsx'
import FilmsPage from './Pages/FilmsPage.jsx'
import FilmDetailPage from './Pages/FilmDetailPage.jsx'
import ReservationsPage from './Pages/ReservationsPage.jsx'
import AdminPage from './Pages/AdminPage.jsx'
import ComingSoonPage from './Pages/ComingSoonPage.jsx'
import AuthWrapper from './Wrappers/AuthWrapper.jsx'
import AdminRoute from './Wrappers/AdminRoute.jsx'

const CalendarPage = lazy(() => import('./Pages/CalendarPage.jsx'))

function App() {
  const [isConnected, setIsConnected] = useState(authServices.isConnected())
  const [user, setUser] = useState(authServices.getUser())

  return (
    <AuthContext.Provider value={{ isConnected, setIsConnected, user, setUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion" element={<LoginPage />} />
          <Route path="/inscription" element={<RegisterPage />} />
          <Route path="/profil" element={<AuthWrapper><ProfilePage /></AuthWrapper>} />
          <Route path="/films" element={<AuthWrapper><FilmsPage /></AuthWrapper>} />
          <Route path="/films/:id" element={<AuthWrapper><FilmDetailPage /></AuthWrapper>} />
          <Route path="/reservations" element={<AuthWrapper><ReservationsPage /></AuthWrapper>} />
          <Route
            path="/calendrier"
            element={
              <AuthWrapper>
                <Suspense fallback={<div className="container py-5" role="status">Chargement du calendrier...</div>}>
                  <CalendarPage />
                </Suspense>
              </AuthWrapper>
            }
          />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="*" element={<ComingSoonPage title="Page introuvable" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
