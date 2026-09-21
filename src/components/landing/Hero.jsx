import { Link } from 'react-router-dom'

/**
 * Hero - primeiro filho da Landing.
 *
 * Porta a <section class="hero"> da Sprint 3: selo, título com destaque,
 * subtítulo, dois CTAs, as três estatísticas e o mockup de celular que
 * flutua. Todo o conteúdo chega por props (src/data/landing.js); o único
 * estado que o componente conhece é se existe sessão, para decidir para
 * onde o CTA principal aponta.
 *
 * Estrutura pai -> filho:
 *   Hero (pai)
 *     |-- Estatistica (filho, uma por número do rodapé do hero)
 *     |-- MockupCelular (filho, o aparelho ilustrativo)
 */
function Hero({ dados, autenticado }) {
  const { selo, titulo, tituloDestaque, tituloFim, subtitulo, acoes, stats, mockup } = dados

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex items-center overflow-hidden bg-gradient-to-br from-bg to-bg-soft px-6 pb-8 pt-16 text-ink md:pb-12 md:pt-20 lg:min-h-[calc(100vh_-_var(--header-h))] lg:px-8 lg:pb-20 lg:pt-24"
    >
      {/* Os dois halos verdes que no CSS original eram ::before e ::after */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] opacity-15"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[20%] -left-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,var(--accent)_0%,transparent_70%)] opacity-10"
      />

      <div className="relative z-[1] mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div className="grid justify-items-center gap-8 text-center lg:justify-items-start lg:text-left">
          <span className="rounded-full border border-accent/30 bg-accent/15 px-4 py-1.5 text-xs font-semibold text-accent sm:text-[0.85rem]">
            {selo}
          </span>

          <h1
            id="hero-title"
            className="font-display text-[1.9rem] font-black leading-[1.05] tracking-[-0.02em] sm:text-[2.25rem] md:text-[clamp(2.5rem,5vw,4.5rem)]"
          >
            {titulo}
            <span className="text-accent">{tituloDestaque}</span>
            {tituloFim}
          </h1>

          <p className="max-w-[550px] text-[1.05rem] leading-relaxed text-ink-2 md:text-[1.25rem]">
            {subtitulo}
          </p>

          <div className="flex w-full flex-col flex-wrap justify-center gap-4 sm:w-auto sm:flex-row lg:justify-start">
            <Link
              to={autenticado ? '/painel' : '/login'}
              className="inline-flex items-center justify-center rounded-full border-2 border-accent bg-accent px-8 py-3.5 font-semibold text-bg transition hover:-translate-y-0.5 hover:border-accent-hi hover:bg-accent-hi hover:shadow-glow"
            >
              {autenticado ? acoes.primaria.labelAutenticado : acoes.primaria.label}
            </Link>

            <a
              href={acoes.secundaria.href}
              className="inline-flex items-center justify-center rounded-full border-2 border-line-2 bg-transparent px-8 py-3.5 font-semibold text-ink transition hover:border-ink hover:bg-surface-2"
            >
              {acoes.secundaria.label}
            </a>
          </div>

          <div className="mx-auto grid w-full max-w-[500px] grid-cols-3 gap-2 border-t border-line pt-8 text-left sm:gap-4 lg:mx-0 lg:max-w-none">
            {stats.map(stat => (
              <Estatistica key={stat.id} valor={stat.valor} descricao={stat.descricao} />
            ))}
          </div>
        </div>

        <aside aria-hidden="true" className="flex items-center justify-center">
          <MockupCelular dados={mockup} />
        </aside>
      </div>
    </section>
  )
}

/**
 * Estatistica - filho do Hero: um número grande com a legenda embaixo.
 */
function Estatistica({ valor, descricao }) {
  return (
    <div className="grid gap-1">
      <strong className="font-display text-2xl font-extrabold leading-none text-accent lg:text-[2rem]">
        {valor}
      </strong>
      <span className="text-xs text-ink-2 sm:text-[0.85rem]">{descricao}</span>
    </div>
  )
}

/**
 * MockupCelular - filho do Hero: o aparelho ilustrativo com a tela do app.
 * Some na horizontal de telas baixas, como no CSS original.
 */
function MockupCelular({ dados }) {
  return (
    <div className="animate-flutuar relative h-[400px] w-[200px] rounded-[40px] bg-black p-3 shadow-glow ring-8 ring-accent/10 sm:h-[440px] sm:w-[220px] md:h-[480px] md:w-[240px] xl:h-[560px] xl:w-[280px] [@media(max-height:500px)_and_(orientation:landscape)]:hidden">
      <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-[30px] bg-surface">
        <div className="bg-accent px-6 pb-4 pt-12 text-center text-[1.1rem] font-bold text-bg">
          {dados.cabecalho}
        </div>

        <div className="grid content-center gap-4 px-6 py-8">
          <p className="rounded-md border-2 border-accent bg-bg p-4 text-center text-[0.95rem] font-semibold text-ink">
            {dados.deteccao}
          </p>
          <p className="text-center text-sm text-ink-2">{dados.pergunta}</p>
          <p className="rounded-full bg-accent py-3.5 text-center text-[0.95rem] font-bold text-bg">
            {dados.botao}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Hero
