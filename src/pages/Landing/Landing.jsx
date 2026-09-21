import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

/**
 * Landing - Rota pública "/".
 *
 * PONTO DE PARTIDA: esta é a estrutura mínima da página inicial pública.
 * A landing completa da Sprint 3 (Front-End Design) deve ser portada para
 * cá em componentes Tailwind: hero, solução, público, galeria, equipe,
 * contato e rodapé. Os CTAs abaixo já respeitam a sessão do usuário.
 */
function Landing() {
  const { autenticado } = useAuth()

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(0,200,150,0.12),transparent_55%)]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          Câmera inteligente para estudantes
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-ink sm:text-6xl">
          A câmera que <span className="text-accent">ensina</span>, não entrega.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-ink-2">
          Fotografe a lousa, o slide ou o exercício. Em menos de 30 segundos,
          o LensLab transforma a foto em material de estudo ou em uma resolução guiada.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to={autenticado ? '/painel' : '/login'}
            className="w-full rounded-full bg-accent px-8 py-3 font-semibold text-bg transition hover:bg-accent-hi sm:w-auto"
          >
            {autenticado ? 'Ir para o painel' : 'Começar agora'}
          </Link>
          <Link
            to="/sobre"
            className="w-full rounded-full border border-line-2 px-8 py-3 font-semibold text-ink transition hover:border-accent hover:text-accent sm:w-auto"
          >
            Conhecer o projeto
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Landing
