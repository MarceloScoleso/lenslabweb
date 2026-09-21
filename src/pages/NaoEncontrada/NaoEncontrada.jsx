import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * NaoEncontrada - Rota coringa para endereços inexistentes (404).
 */
function NaoEncontrada() {
  const { autenticado } = useAuth()

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-ink">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-ink-2">
        O endereço que você tentou abrir não existe ou foi movido.
      </p>
      <Link
        to={autenticado ? '/painel' : '/'}
        className="mt-8 rounded-full bg-accent px-6 py-3 font-semibold text-bg transition hover:bg-accent-hi"
      >
        {autenticado ? 'Voltar ao painel' : 'Voltar ao início'}
      </Link>
    </section>
  )
}

export default NaoEncontrada
