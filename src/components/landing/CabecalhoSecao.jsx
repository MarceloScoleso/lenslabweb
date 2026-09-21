/**
 * CabecalhoSecao - filho compartilhado por Solucao, Publico, GaleriaDemo,
 * Equipe e Contato.
 *
 * Reproduz o bloco .section-header da landing da Sprint 3: etiqueta,
 * título com uma palavra em destaque e linha de apoio. Recebe tudo por
 * props, inclusive o id usado pelo aria-labelledby da seção pai.
 */
function CabecalhoSecao({
  id,
  tag,
  titulo,
  tituloDestaque,
  tituloFim = '',
  lead,
  alinhamento = 'centro'
}) {
  const aoCentro = alinhamento === 'centro'

  return (
    <header
      className={`grid gap-6 ${
        aoCentro ? 'mx-auto mb-12 max-w-[800px] justify-items-center text-center lg:mb-20' : 'mb-8 justify-items-start text-left'
      }`}
    >
      <span className="rounded-full bg-accent/10 px-4 py-1.5 text-[0.85rem] font-bold uppercase tracking-[0.05em] text-accent">
        {tag}
      </span>

      <h2
        id={id}
        className="font-display text-[1.5rem] font-extrabold tracking-[-0.02em] text-ink sm:text-[1.75rem] md:text-[clamp(2rem,4vw,3rem)]"
      >
        {titulo}
        <span className="text-accent">{tituloDestaque}</span>
        {tituloFim}
      </h2>

      {lead && <p className="text-base leading-relaxed text-ink-2 md:text-[1.15rem]">{lead}</p>}
    </header>
  )
}

export default CabecalhoSecao
