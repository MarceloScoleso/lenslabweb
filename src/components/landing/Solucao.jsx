import CabecalhoSecao from './CabecalhoSecao.jsx'

/**
 * Solucao - seção "#solucao" da Landing.
 *
 * Porta a <section id="solucao"> da Sprint 3: o cabeçalho, o par
 * problema x solução ligado por uma seta e os três modos do produto.
 *
 * Estrutura pai -> filho:
 *   Solucao (pai)
 *     |-- CabecalhoSecao (filho)
 *     |-- CartaoComparacao (filho, duas vezes: problema e solução)
 *     |-- CartaoModo (filho, um por modo do LensLab)
 */
function Solucao({ dados }) {
  const { tag, titulo, tituloDestaque, lead, problema, resolucao, modosTitulo, modos } = dados

  return (
    <section
      id="solucao"
      aria-labelledby="solucao-title"
      className="scroll-mt-[var(--header-h)] bg-bg px-6 py-12 md:py-16 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <CabecalhoSecao
          id="solucao-title"
          tag={tag}
          titulo={titulo}
          tituloDestaque={tituloDestaque}
          lead={lead}
        />

        <div className="mb-12 grid items-stretch gap-6 lg:mb-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <CartaoComparacao dados={problema} variante="problema" />

          <div
            aria-hidden="true"
            className="place-self-center rotate-90 font-display text-5xl font-black text-accent lg:rotate-0"
          >
            →
          </div>

          <CartaoComparacao dados={resolucao} variante="solucao" />
        </div>

        <div className="mb-8 text-center lg:mb-12">
          <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.02em] text-ink md:text-[2rem]">
            {modosTitulo}
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {modos.map((modo, indice) => (
            <CartaoModo
              key={modo.id}
              dados={modo}
              // No tablet são 2 colunas: o terceiro cartão ocupa a linha toda
              className={indice === modos.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * CartaoComparacao - filho da Solucao: "o problema hoje" x "com o LensLab".
 * A variante muda só a pele do cartão, nunca a estrutura.
 */
function CartaoComparacao({ dados, variante }) {
  const ehSolucao = variante === 'solucao'

  return (
    <article
      className={`grid content-start gap-4 rounded-xl border-2 p-8 ${
        ehSolucao
          ? 'border-transparent bg-gradient-to-br from-accent-hi to-accent text-bg'
          : 'border-danger/20 bg-surface text-ink'
      }`}
    >
      <div aria-hidden="true" className="text-5xl">
        {dados.icone}
      </div>

      <h3 className="font-display text-[1.5rem] font-bold">{dados.titulo}</h3>

      <p className={`leading-relaxed ${ehSolucao ? 'text-bg/80' : 'text-ink-2'}`}>{dados.texto}</p>

      <p className="mt-4 border-t-2 border-dashed border-current pt-4 opacity-90">
        <strong className="block font-display text-[1.4rem] font-bold">{dados.metricaValor}</strong>
        {dados.metricaTexto}
      </p>
    </article>
  )
}

/**
 * CartaoModo - filho da Solucao: um dos três modos, com a faixa verde no topo.
 */
function CartaoModo({ dados, className = '' }) {
  return (
    <article
      className={`group relative grid gap-4 overflow-hidden rounded-xl border border-line bg-surface p-8 shadow-card transition hover:-translate-y-2 hover:border-accent hover:shadow-glow ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />

      <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink-3">{dados.tag}</span>

      <div aria-hidden="true" className="text-5xl">
        {dados.icone}
      </div>

      <h4 className="font-display text-[1.4rem] font-bold text-ink">{dados.titulo}</h4>

      <p className="leading-relaxed text-ink-2">{dados.texto}</p>

      <span
        className={`justify-self-start rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-[0.05em] ${
          dados.ativo ? 'bg-accent/15 text-accent' : 'bg-surface-3 text-ink-3'
        }`}
      >
        {dados.situacao}
      </span>
    </article>
  )
}

export default Solucao
