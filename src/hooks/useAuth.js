import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext.jsx'

/**
 * useAuth - Acesso ao estado de autenticação em qualquer componente.
 * Retorna { usuario, autenticado, verificando, entrar, sair }.
 */
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  return contexto
}
