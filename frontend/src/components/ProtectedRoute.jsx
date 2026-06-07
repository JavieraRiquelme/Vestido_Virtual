import { Navigate } from 'react-router-dom'
import { estaAutenticado } from '../utils/auth'

export default function ProtectedRoute({ children }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />
  }
  return children
}
