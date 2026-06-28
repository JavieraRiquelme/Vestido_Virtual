import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import MisOutfits from './pages/MisOutfits.jsx'
import Recomendaciones from './pages/Recomendaciones.jsx'
import ResultadoOutfit from './pages/ResultadoOutfit.jsx'
import CrearOutfit from './pages/CrearOutfit.jsx'
import MiCloset from './pages/MiCloset.jsx'
import OutfitDetalle from './pages/OutfitDetalle.jsx'
import SubirPrenda from './pages/SubirPrenda.jsx'
import PizarronOutfit from './pages/PizarronOutfit.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import RecuperarPassword from './pages/RecuperarPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import NavBar from './components/NavBar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { estaAutenticado } from './utils/auth'

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={estaAutenticado() ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/registro"
        element={estaAutenticado() ? <Navigate to="/" replace /> : <Registro />}
      />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/reset-password"     element={<ResetPassword />} />

      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/mis-outfits" replace /></ProtectedRoute>} />
      <Route path="/mis-outfits" element={<ProtectedRoute><MisOutfits /></ProtectedRoute>} />
      <Route path="/recomendaciones" element={<ProtectedRoute><Recomendaciones /></ProtectedRoute>} />
      <Route path="/resultado-outfit" element={<ProtectedRoute><ResultadoOutfit /></ProtectedRoute>} />
      <Route path="/crear-outfit" element={<ProtectedRoute><CrearOutfit /></ProtectedRoute>} />
      <Route path="/mi-closet" element={<ProtectedRoute><MiCloset /></ProtectedRoute>} />
      <Route path="/subir-prenda" element={<ProtectedRoute><SubirPrenda /></ProtectedRoute>} />
      <Route path="/outfit/:id" element={<ProtectedRoute><OutfitDetalle /></ProtectedRoute>} />
      <Route path="/pizarron" element={<ProtectedRoute><PizarronOutfit /></ProtectedRoute>} />
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.access_token) {
        localStorage.setItem('closy_token', session.access_token)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <div className="app-shell">
        <NavBar />
        <main className="app-main">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
