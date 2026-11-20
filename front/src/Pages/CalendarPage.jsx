import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/react/daygrid'
import timeGridPlugin from '@fullcalendar/react/timegrid'
import classicThemePlugin from '@fullcalendar/react/themes/classic'
import frLocale from '@fullcalendar/react/locales/fr'
import '@fullcalendar/react/skeleton.css'
import '@fullcalendar/react/themes/classic/theme.css'
import '@fullcalendar/react/themes/classic/palette.css'
import './CalendarPage.css'
import Header from '../Components/Header.jsx'
import reservationsServices from '../Services/reservationsServices.js'
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

function CalendarPage() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [seats, setSeats] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function loadCalendar() {
      try {
        const [screeningsResponse, reservationsResponse] = await Promise.all([
          screeningsServices.getAll(),
          reservationsServices.getMine(),
        ])
        if (!isCurrent) {
          return
        }

        const reservationsByScreening = new Map(
          reservationsResponse.data.map((reservation) => [String(reservation.re_screening), reservation]),
        )
        const calendarEvents = screeningsResponse.data.map((screening) => {
          const reservation = reservationsByScreening.get(String(screening.sc_id))
          return {
            id: 'screening-' + screening.sc_id,
            title: reservation ? 'Ma réservation · ' + screening.fi_title : screening.fi_title,
            start: screening.sc_datetime,
            className: reservation ? 'calendar-event--reservation' : 'calendar-event--screening',
            extendedProps: { screening, reservation },
          }
        })

        setEvents(calendarEvents)
      } catch (error) {
        if (!isCurrent) {
          return
        }
        const message = error.response && error.response.data && error.response.data.error
        setErrorMessage(message || 'Impossible de charger le calendrier.')
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadCalendar()

    return () => {
      isCurrent = false
    }
  }, [refreshKey])

  function openEvent(info) {
    setSelectedEvent(info.event)
    setSeats(1)
    setErrorMessage('')
  }

  function refreshEvents() {
    setIsLoading(true)
    setErrorMessage('')
    setRefreshKey((current) => current + 1)
  }

  async function handleReservation() {
    const screening = selectedEvent.extendedProps.screening
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await reservationsServices.create(screening.sc_id, Number(seats))
      setSelectedEvent(null)
      setNotice('Votre réservation a bien été enregistrée.')
      refreshEvents()
    } catch (error) {
      const message = error.response && error.response.data && error.response.data.error
      setErrorMessage(message || 'Impossible de réserver cette séance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCancelReservation() {
    const reservation = selectedEvent.extendedProps.reservation
    if (!window.confirm('Annuler votre réservation pour « ' + selectedScreening.fi_title + ' » ?')) {
      return
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await reservationsServices.cancel(reservation.re_id)
      setSelectedEvent(null)
      setNotice('Votre réservation a été annulée.')
      refreshEvents()
    } catch (error) {
      const message = error.response && error.response.data && error.response.data.error
      setErrorMessage(message || 'Impossible d’annuler cette réservation.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedScreening = selectedEvent && selectedEvent.extendedProps.screening
  const selectedReservation = selectedEvent && selectedEvent.extendedProps.reservation
  const isPastScreening = selectedScreening && new Date(selectedScreening.sc_datetime) <= new Date()
  const totalPrice = selectedScreening ? Number(selectedScreening.sc_price) * Number(seats) : 0

  return (
    <div>
      <Header />
      <main className="container py-5 calendar-page">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
          <div>
            <h1 className="display-5 fw-bold mb-2">Calendrier des séances</h1>
            <p className="text-muted mb-0">Consultez les séances et repérez vos réservations.</p>
          </div>
          <Link className="btn btn-outline-primary" to="/reservations">Voir mes réservations</Link>
        </div>

        {notice && <div className="alert alert-success" role="status">{notice}</div>}
        {errorMessage && !selectedEvent && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
        {isLoading && <p className="text-muted" role="status">Chargement du calendrier...</p>}

        {!isLoading && !errorMessage && (
          <>
            <div className="d-flex flex-wrap gap-3 mb-3 calendar-legend" aria-label="Légende du calendrier">
              <span>
                <span className="calendar-legend__swatch calendar-legend__swatch--screening" aria-hidden="true" />
                Séance
              </span>
              <span>
                <span className="calendar-legend__swatch calendar-legend__swatch--reservation" aria-hidden="true" />
                Ma réservation
              </span>
            </div>
            <div className="calendar-board">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, classicThemePlugin]}
                className="calendar-widget"
                initialView="dayGridMonth"
                locale={frLocale}
                events={events}
                eventClick={openEvent}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                buttons={{
                  today: { text: 'Aujourd’hui' },
                  dayGridMonth: { text: 'Mois' },
                  timeGridWeek: { text: 'Semaine' },
                  timeGridDay: { text: 'Jour' },
                }}
                eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                dayMaxEvents
                height="auto"
                eventDisplay="block"
              />
            </div>
          </>
        )}
      </main>

      {selectedScreening && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendarEventTitle"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title fs-5" id="calendarEventTitle">{selectedScreening.fi_title}</h2>
                  <button
                    className="btn-close"
                    type="button"
                    aria-label="Fermer"
                    onClick={() => setSelectedEvent(null)}
                    disabled={isSubmitting}
                  ></button>
                </div>
                <div className="modal-body">
                  <p><strong>Séance :</strong> {formatDate(selectedScreening.sc_datetime)}</p>
                  <p><strong>Salle :</strong> {selectedScreening.ro_name}</p>
                  <p><strong>Prix par place :</strong> {Number(selectedScreening.sc_price).toFixed(2)} €</p>
                  {selectedReservation && (
                    <p><strong>Places réservées :</strong> {selectedReservation.re_seats}</p>
                  )}
                  {errorMessage && <div className="alert alert-danger" role="alert">{errorMessage}</div>}
                  {!selectedReservation && !isPastScreening && (
                    <>
                      <label className="form-label" htmlFor="calendarSeats">Nombre de places</label>
                      <input
                        className="form-control"
                        id="calendarSeats"
                        type="number"
                        min="1"
                        step="1"
                        value={seats}
                        onChange={(event) => setSeats(event.target.value)}
                        required
                      />
                      <p className="mt-3 mb-0">Total : <strong>{totalPrice.toFixed(2)} €</strong></p>
                    </>
                  )}
                  {!selectedReservation && isPastScreening && (
                    <p className="text-muted mb-0">Cette séance est passée; la réservation n’est plus possible.</p>
                  )}
                </div>
                <div className="modal-footer">
                  <Link className="btn btn-link me-auto" to={'/films/' + selectedScreening.sc_film}>
                    Détails du film
                  </Link>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    disabled={isSubmitting}
                  >
                    Fermer
                  </button>
                  {selectedReservation ? (
                    <button
                      className="btn btn-outline-danger"
                      type="button"
                      onClick={handleCancelReservation}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Annulation...' : 'Annuler ma réservation'}
                    </button>
                  ) : !isPastScreening && (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={handleReservation}
                      disabled={isSubmitting || !Number.isInteger(Number(seats)) || Number(seats) < 1}
                    >
                      {isSubmitting ? 'Réservation...' : 'Réserver'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CalendarPage
