import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MisOutfits from './pages/MisOutfits.jsx'
import Recomendaciones from './pages/Recomendaciones.jsx'
import ResultadoOutfit from './pages/ResultadoOutfit.jsx'
import CrearOutfit from './pages/CrearOutfit.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/mis-outfits" replace />} />
        <Route path="/mis-outfits" element={<MisOutfits />} />
        <Route path="/recomendaciones" element={<Recomendaciones />} />
        <Route path="/resultado-outfit" element={<ResultadoOutfit />} />
        <Route path="/crear-outfit" element={<CrearOutfit />} />
      </Routes>
    </BrowserRouter>
  )
}
