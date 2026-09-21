import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * RotaPrivada - Guarda das rotas que exigem login.
 *
 * Sem sessão, redireciona para /login guardando a rota de origem em
 * location.state, para que o usuário volte exatamente para onde estava
 * depois de entrar.
 */
function RotaPrivada() {
  const { autenticado, verificando } = useAuth()
  const location = useLocation()

  if (verificando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status">
        <div className="flex items-center gap-3 text-sm text-ink-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-line-2 border-t-accent" />
          Verificando sua sessão...
        </div>
      </div>
    )
  }

  if (!autenticado) {
    return <Navigate to="/login" replace state={{ de: location.pathname + location.search }} />
  }

  return <Outlet />
}

export default RotaPrivada
