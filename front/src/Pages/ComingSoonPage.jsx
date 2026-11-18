import { Link } from 'react-router'
import Header from '../Components/Header.jsx'

function ComingSoonPage({ title }) {
  return (
    <div>
      <Header />
      <main className="container py-5">
        <p className="text-uppercase text-secondary small fw-semibold">CineHub</p>
        <h1 className="display-5">{title}</h1>
        <p className="lead text-secondary">Cette page sera construite à l’étape suivante.</p>
        <Link className="btn btn-primary" to="/">
          Retour à l’accueil
        </Link>
      </main>
    </div>
  )
}

export default ComingSoonPage
