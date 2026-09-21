import CabecalhoSecao from './CabecalhoSecao.jsx'

/**
 * GaleriaDemo - seção "#galeria" da Landing.
 *
 * Porta a <section id="galeria"> da Sprint 3: quatro mockups de celular
 * mostrando telas do produto. O nome leva "Demo" para não se confundir
 * com a página /galeria do app, que mostra as fotos reais do estudante.
 *
 * Estrutura pai -> filho:
 *   GaleriaDemo (pai)
 *     |-- CabecalhoSecao (filho)
 *     |-- MockupTela (filho, um por tela demonstrada)
 *           |-- ConteudoTela (neto, muda conforme o "tipo" do item)
 */
function GaleriaDemo({ dados }) {
  const { tag, titulo, tituloDestaque, lead, itens } = dados

  return (
    <section
      id="galeria"
      aria-labelledby="galeria-title"
      className="scroll-mt-[var(--header-h)] bg-surface px-6 py-12 md:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <CabecalhoSecao
          id="galeria-title"
          tag={tag}
          titulo={titulo}
          tituloDestaque={tituloDestaque}
          lead={lead}
        />

        <div className="grid items-start justify-items-center gap-8 md:grid-cols-2 lg:grid-cols-4">
          {itens.map(item => (
            <MockupTela key={item.id} dados={item} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * MockupTela - filho da GaleriaDemo: a moldura do aparelho, a tela e a legenda.
 * O item em destaque continua maior no tablet, como no CSS original.
 */
function MockupTela({ dados }) {
  const tamanho = dados.destaque
    ? 'h-[420px] w-[220px] sm:h-[460px] sm:w-[240px] lg:h-[420px] lg:w-[210px]'
    : 'h-[420px] w-[220px] sm:h-[460px] sm:w-[240px] md:h-[420px] md:w-[210px]'

  return (
    <figure className="grid place-items-center gap-4">
      <div
        className={`relative rounded-[32px] bg-bg p-2.5 shadow-card transition hover:-translate-y-2 hover:-rotate-1 ${tamanho}`}
      >
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-3 z-[2] h-3 w-[60px] -translate-x-1/2 rounded-[6px] bg-bg"
        />

        <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden rounded-[24px] bg-surface-2">
          <div
            className={`px-4 pb-3 pt-8 text-center text-[0.9rem] font-bold ${
              dados.cabecalhoAccent ? 'bg-accent text-bg' : 'bg-bg text-ink'
            }`}
          >
            {dados.cabecalho}
          </div>

          <div className="grid content-start gap-3 p-5">
            <ConteudoTela dados={dados} />
          </div>
        </div>
      </div>

      <figcaption className="text-center text-[0.9rem] font-semibold text-ink-2">
        {dados.legenda}
      </figcaption>
    </figure>
  )
}

/**
 * ConteudoTela - neto da GaleriaDemo: escolhe o miolo da tela pelo "tipo"
 * do item, em vez de repetir quatro componentes quase iguais.
 */
function ConteudoTela({ dados }) {
  if (dados.tipo === 'deteccao') {
    return (
      <>
        <div className="grid grid-cols-[auto_1fr] items-center gap-2 rounded-md border-2 border-accent bg-bg p-3 text-[0.85rem]">
          <span aria-hidden="true" className="text-2xl">
            {dados.deteccao.icone}
          </span>
          <span>
            <strong className="block text-ink">{dados.deteccao.titulo}</strong>
            <small className="text-xs text-ink-2">{dados.deteccao.subtitulo}</small>
          </span>
        </div>
        <BotoesTela botoes={dados.botoes} />
      </>
    )
  }

  if (dados.tipo === 'lista') {
    return (
      <>
        <Etiqueta texto={dados.etiqueta} />
        <h5 className="font-display text-[1.1rem] font-bold text-ink">{dados.subtitulo}</h5>
        <ul className="grid gap-1.5">
          {dados.itens.map(item => (
            <li key={item} className="rounded-sm bg-bg px-3 py-2 text-[0.85rem] text-ink">
              {item}
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (dados.tipo === 'passo') {
    return (
      <>
        <small className="text-xs font-bold uppercase tracking-[0.1em] text-accent">
          {dados.passo}
        </small>
        <h5 className="font-display text-[1.1rem] font-bold text-ink">{dados.subtitulo}</h5>
        <p className="text-[0.85rem] text-ink-2">{dados.pergunta}</p>
        <BotoesTela botoes={dados.botoes} />
      </>
    )
  }

  return (
    <>
      <Etiqueta texto={dados.etiqueta} />
      <ul className="grid gap-1.5">
        {dados.materias.map(materia => (
          <li
            key={materia.nome}
            className="grid grid-cols-[1fr_auto] items-center rounded-sm bg-bg px-3 py-2 text-[0.85rem] text-ink"
          >
            <span>{materia.nome}</span>
            <small className="text-[0.7rem] text-ink-2">{materia.total}</small>
          </li>
        ))}
      </ul>
    </>
  )
}

/** Etiqueta - pílula usada no topo de algumas telas do mockup. */
function Etiqueta({ texto }) {
  return (
    <span className="justify-self-start rounded-full bg-bg px-3 py-1.5 text-xs font-semibold text-ink">
      {texto}
    </span>
  )
}

/**
 * BotoesTela - botões ilustrativos dentro do mockup. São <span>, e não
 * <button>: a tela é uma figura, não um controle de verdade.
 */
function BotoesTela({ botoes }) {
  return (
    <>
      {botoes.map(botao => {
        if (botao.estilo === 'contorno') {
          return (
            <span
              key={botao.label}
              className="rounded-md border border-line-2 py-2.5 text-center text-[0.85rem] font-semibold text-ink-2"
            >
              {botao.label}
            </span>
          )
        }

        if (botao.estilo === 'pequeno') {
          return (
            <span
              key={botao.label}
              className="justify-self-start rounded-md bg-accent px-4 py-2 text-[0.8rem] font-semibold text-bg"
            >
              {botao.label}
            </span>
          )
        }

        return (
          <span
            key={botao.label}
            className="rounded-md bg-accent py-2.5 text-center text-[0.85rem] font-semibold text-bg"
          >
            {botao.label}
          </span>
        )
      })}
    </>
  )
}

export default GaleriaDemo
