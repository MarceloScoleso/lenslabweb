import CabecalhoSecao from './CabecalhoSecao.jsx'

/**
 * Publico - seção "#publico" da Landing.
 *
 * Porta a <section id="publico"> da Sprint 3: as quatro personas em grade
 * e a citação de um teste de conceito.
 *
 * Estrutura pai -> filho:
 *   Publico (pai)
 *     |-- CabecalhoSecao (filho)
 *     |-- CartaoPersona (filho, um por persona)
 */
function Publico({ dados }) {
  const { tag, titulo, tituloDestaque, lead, personas, citacao } = dados

  return (
    <section
      id="publico"
      aria-labelledby="publico-title"
      className="scroll-mt-[var(--header-h)] bg-bg-soft px-6 py-12 md:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <CabecalhoSecao
          id="publico-title"
          tag={tag}
          titulo={titulo}
          tituloDestaque={tituloDestaque}
          lead={lead}
        />

        <div className="mb-12 grid gap-4 md:grid-cols-2 lg:mb-20 lg:grid-cols-4 lg:gap-6">
          {personas.map(persona => (
            <CartaoPersona key={persona.id} dados={persona} />
          ))}
        </div>

        <blockquote className="mx-auto grid max-w-[800px] gap-4 rounded-lg border-l-4 border-accent bg-accent/10 px-6 py-6 md:px-12 md:py-8">
          <p className="text-[1.05rem] italic leading-relaxed text-ink md:text-[1.3rem]">
            {citacao.texto}
          </p>
          <cite className="text-sm font-semibold not-italic text-accent">{citacao.autor}</cite>
        </blockquote>
      </div>
    </section>
  )
}

/**
 * CartaoPersona - filho do Publico: avatar em emoji, título e descrição.
 */
function CartaoPersona({ dados }) {
  return (
    <article className="grid gap-4 rounded-lg border border-line bg-surface-2 p-8 transition hover:-translate-y-1 hover:border-accent hover:bg-accent/10">
      <div aria-hidden="true" className="text-5xl">
        {dados.avatar}
      </div>
      <h3 className="font-display text-[1.15rem] font-bold text-ink">{dados.titulo}</h3>
      <p className="text-[0.95rem] leading-relaxed text-ink-2">{dados.texto}</p>
    </article>
  )
}

export default Publico
