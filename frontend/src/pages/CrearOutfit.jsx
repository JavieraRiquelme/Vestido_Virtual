import { useNavigate } from 'react-router-dom'
import './CrearOutfit.css'

export default function CrearOutfit() {
  const navigate = useNavigate()

  return (
    <div className="crear-outfit">
      <span className="crear-outfit__mascota" role="img" aria-label="Closy">🐙</span>
      <h1 className="crear-outfit__titulo">Crea tu outfit</h1>
      <div className="crear-outfit__card">
        <p>¡Esta función está en construcción!</p>
        <p>Pronto podrás armar tu propio outfit desde aquí.</p>
      </div>
      <button className="crear-outfit__btn" onClick={() => navigate('/recomendaciones')}>
        Volver
      </button>
    </div>
  )
}
