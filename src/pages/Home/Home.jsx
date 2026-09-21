import { Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { calcularPercentual, arredondar, calcularEstatisticas } from '../../utils/math-utils.js'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { CONTAINER, BTN_PRIMARIO, BTN_SECUNDARIO } from '../../styles/classes.js'

const ATALHOS = [
  {
    to: '/camera',
    icone: 'camera',
    titulo: 'Capturar agora',
    texto: 'Abra a câmera, fotografe o material e escolha o que fazer com a imagem.'
  },
  {
    to: '/estuda-comigo',
    icone: 'livro',
    titulo: 'Estuda Comigo',
    texto: 'Foto do material vira resumo, flashcards e quiz automaticamente.'
  },
  {
    to: '/resolve-aqui',
    icone: 'calculadora',
    titulo: 'Resolve Aqui',
    texto: 'Foto do exercício vira uma resolução guiada passo a passo.'
  }
]

/** Moldura de cartão de atalho, repetida pelos quatro cards. */
const CARTAO =
  'group relative block rounded-md border border-line bg-surface p-[1.65rem] transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-2'

/**
 * Home - Página inicial com o dashboard do estudante
 *
 * Estrutura pai -> filho:
 *   Home (pai)
 *     |-- StatCard (filho, repetido 4x com props diferentes)
 *     |-- CartaoAtalho (filho, repetido para cada atalho)
 *
 * Usa localStorage para ler as estatísticas de uso.
 * Usa Math para calcular médias e percentuais.
 */
function Home() {
  const [notas] = useLocalStorage('lenslab_notas', [])
  const [exercicios] = useLocalStorage('lenslab_exercicios', [])

  // Cálculos com Math
  const totalCapturas = notas.length + exercicios.length
  const totalAcertos = exercicios.filter(e => e.acertou).length
  const taxaAcerto = calcularPercentual(totalAcertos, exercicios.length)

  // Tempo que o LensLab levou para gerar o material, nos dois modos.
  // É a métrica da promessa central do produto: menos de 30 segundos
  // entre fotografar e ter conteúdo pronto.
  const temposEmSegundos = [...notas, ...exercicios]
    .map(item => (item.tempoProcessamento || 0) / 1000)
    .filter(t => t > 0)
  const { media: mediaTempoEstudo } = calcularEstatisticas(temposEmSegundos)

  return (
    <div className="bg-bg">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line pb-[3.25rem] pt-14 sm:pb-20 sm:pt-[5.5rem]">
        <div className="fundo-painel pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className={CONTAINER}>
          <div className="relative z-[1] grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="max-w-[620px]">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/6 px-3 py-[0.35rem] font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-accent">
                <span
                  className="animate-piscar h-[5px] w-[5px] rounded-full bg-accent shadow-[0_0_8px_var(--accent)]"
                  aria-hidden="true"
                />
                LensLab — Sprint 3
              </span>

              <h1 className="mb-5 text-[clamp(2.75rem,6vw,4.25rem)] font-bold leading-none tracking-[-0.045em]">
                Sua câmera<br />
                <span className="text-accent">que ensina.</span>
              </h1>

              <p className="mb-9 max-w-[52ch] text-[1.0625rem] leading-[1.65] text-ink-2">
                Fotografe qualquer material didático e transforme em resumo, flashcards
                e quiz automáticos. Ou peça ajuda passo a passo em um exercício.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link to="/camera" className={BTN_PRIMARIO}>
                  <Icon nome="camera" />
                  Abrir câmera
                </Link>
                <Link to="/estuda-comigo" className={BTN_SECUNDARIO}>
                  <Icon nome="livro" />
                  Estuda Comigo
                </Link>
                <Link to="/resolve-aqui" className={BTN_SECUNDARIO}>
                  <Icon nome="calculadora" />
                  Resolve Aqui
                </Link>
              </div>
            </div>

            {/* Moldura decorativa: referência ao visor da câmera */}
            <div
              className="fundo-visor relative hidden aspect-[3/4] place-items-center rounded-lg border border-line lg:grid"
              aria-hidden="true"
            >
              <span className="absolute left-3.5 top-3.5 h-[18px] w-[18px] rounded-tl-[4px] border-2 border-b-0 border-r-0 border-accent opacity-70" />
              <span className="absolute right-3.5 top-3.5 h-[18px] w-[18px] rounded-tr-[4px] border-2 border-b-0 border-l-0 border-accent opacity-70" />
              <span className="absolute bottom-3.5 left-3.5 h-[18px] w-[18px] rounded-bl-[4px] border-2 border-r-0 border-t-0 border-accent opacity-70" />
              <span className="absolute bottom-3.5 right-3.5 h-[18px] w-[18px] rounded-br-[4px] border-2 border-l-0 border-t-0 border-accent opacity-70" />

              <div className="flex flex-col items-center gap-[0.85rem] text-accent">
                <Icon nome="camera" tamanho={30} traco={1.3} />
                <span className="font-mono text-[0.625rem] tracking-[0.22em] text-ink-3">
                  LENSLAB · READY
                </span>
                <div className="mt-1 flex w-24 flex-col gap-1.5">
                  <span className="h-0.5 w-full rounded-[2px] bg-line-2" />
                  <span className="h-0.5 w-[70%] rounded-[2px] bg-accent/40" />
                  <span className="h-0.5 w-[45%] rounded-[2px] bg-line-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard de estatísticas */}
      <section className="py-12 sm:py-18">
        <div className={CONTAINER}>
          <CabecalhoSecao
            eyebrow="Progresso"
            titulo="Seu progresso"
            texto="Estatísticas calculadas a partir da sua atividade no LensLab."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icone="camera"
              titulo="Capturas"
              valor={totalCapturas}
              descricao="fotos processadas"
              cor="primary"
            />
            <StatCard
              icone="livro"
              titulo="Materiais"
              valor={notas.length}
              descricao="prontos para estudar"
              cor="info"
            />
            <StatCard
              icone="checkCircle"
              titulo="Exercícios"
              valor={exercicios.length}
              descricao={exercicios.length > 0 ? `${taxaAcerto}% de acerto` : 'resolvidos'}
              cor="success"
            />
            <StatCard
              icone="relogio"
              titulo="Tempo médio"
              valor={mediaTempoEstudo > 0 ? arredondar(mediaTempoEstudo, 1) : '—'}
              descricao={mediaTempoEstudo > 0 ? 'segundos para gerar' : 'sem dados ainda'}
              cor="warning"
            />
          </div>
        </div>
      </section>

      {/* Cards de ação */}
      <section className="border-t border-line bg-bg-soft py-12 sm:py-18">
        <div className={CONTAINER}>
          <CabecalhoSecao eyebrow="Atalhos" titulo="O que quer fazer agora?" />

          <div className="grid gap-4 lg:grid-cols-2">
            {ATALHOS.map(atalho => (
              <CartaoAtalho
                key={atalho.to}
                to={atalho.to}
                icone={atalho.icone}
                titulo={atalho.titulo}
                texto={atalho.texto}
              />
            ))}

            <CartaoAtalho
              to="/galeria"
              icone="pasta"
              titulo="Ver Galeria"
              texto={
                totalCapturas > 0
                  ? `${totalCapturas} ${totalCapturas === 1 ? 'item' : 'itens'} na sua central de estudo.`
                  : 'Comece a capturar seu primeiro material.'
              }
            />
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * CabecalhoSecao - filho da Home: etiqueta, título e linha de apoio.
 */
function CabecalhoSecao({ eyebrow, titulo, texto }) {
  return (
    <div className="mb-9">
      <span className="mb-[0.6rem] block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </span>
      <h2 className="mb-[0.4rem] text-[1.75rem] tracking-[-0.035em] text-ink">{titulo}</h2>
      {texto && <p className="text-[0.95rem] text-ink-2">{texto}</p>}
    </div>
  )
}

/**
 * CartaoAtalho - filho da Home: um caminho rápido para outro modo do app.
 */
function CartaoAtalho({ to, icone, titulo, texto }) {
  return (
    <Link to={to} className={CARTAO}>
      <span className="mb-[1.15rem] grid h-[42px] w-[42px] place-items-center rounded-sm bg-accent/12 text-accent transition-colors group-hover:bg-accent/20">
        <Icon nome={icone} tamanho={22} />
      </span>
      <h3 className="mb-[0.4rem] text-[1.0625rem] text-ink">{titulo}</h3>
      <p className="max-w-[42ch] text-[0.9rem] leading-[1.55] text-ink-2">{texto}</p>
      <span className="absolute right-[1.65rem] top-[1.65rem] text-ink-3 transition group-hover:translate-x-[3px] group-hover:text-accent">
        <Icon nome="setaDireita" tamanho={18} />
      </span>
    </Link>
  )
}

export default Home
