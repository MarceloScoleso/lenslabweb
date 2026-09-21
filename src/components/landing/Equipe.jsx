import CabecalhoSecao from './CabecalhoSecao.jsx'

/**
 * Equipe - seção "#equipe" da Landing.
 *
 * Porta a <section id="equipe"> da Sprint 3: os quatro integrantes com
 * iniciais, RM, papel no projeto e uma linha de descrição. Os mesmos
 * nomes e RMs do INTEGRANTES.TXT.
 *
 * Estrutura pai -> filho:
 *   Equipe (pai)
 *     |-- CabecalhoSecao (filho)
 *     |-- CartaoMembro (filho, um por integrante)
 */
function Equipe({ dados }) {
  const { tag, titulo, tituloDestaque, lead, membros } = dados

  return (
    <section
      id="equipe"
      aria-labelledby="equipe-title"
      className="scroll-mt-[var(--header-h)] bg-bg px-6 py-12 md:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <CabecalhoSecao
          id="equipe-title"
          tag={tag}
          titulo={titulo}
          tituloDestaque={tituloDestaque}
          lead={lead}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {membros.map(membro => (
            <CartaoMembro key={membro.id} dados={membro} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * CartaoMembro - filho da Equipe: um integrante do grupo.
 */
function CartaoMembro({ dados }) {
  return (
    <article className="grid gap-3 rounded-xl border border-line bg-surface p-8 text-center shadow-card transition hover:-translate-y-2 hover:border-accent hover:shadow-glow">
      <div
        aria-hidden="true"
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-accent-hi to-accent font-display text-[1.75rem] font-extrabold text-bg"
      >
        {dados.iniciais}
      </div>

      <h3 className="font-display text-[1.05rem] font-bold leading-tight text-ink">{dados.nome}</h3>

      <span className="font-mono text-[0.85rem] font-bold tracking-[0.05em] text-accent">
        {dados.rm}
      </span>

      <p className="text-[0.9rem] font-semibold text-accent">{dados.papel}</p>

      <p className="text-[0.9rem] leading-relaxed text-ink-2">{dados.descricao}</p>
    </article>
  )
}

export default Equipe
