import { Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { calcularPercentual, arredondar, calcularEstatisticas } from '../../utils/math-utils.js'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import styles from './Home.module.css'

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

/**
 * Home - Página inicial com o dashboard do estudante
 *
 * Estrutura pai -> filho:
 *   Home (pai)
 *     |-- StatCard (filho, repetido 4x com props diferentes)
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
    <div className={styles.home}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroFundo} aria-hidden="true" />
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>
                <span className={styles.dot} aria-hidden="true"></span>
                LensLab — Sprint 3
              </span>

              <h1 className={styles.title}>
                Sua câmera<br />
                <span className={styles.highlight}>que ensina.</span>
              </h1>

              <p className={styles.subtitle}>
                Fotografe qualquer material didático e transforme em resumo, flashcards
                e quiz automáticos. Ou peça ajuda passo a passo em um exercício.
              </p>

              <div className={styles.actions}>
                <Link to="/camera" className="btn btn-primary">
                  <Icon nome="camera" />
                  Abrir câmera
                </Link>
                <Link to="/estuda-comigo" className="btn btn-secondary">
                  <Icon nome="livro" />
                  Estuda Comigo
                </Link>
                <Link to="/resolve-aqui" className="btn btn-secondary">
                  <Icon nome="calculadora" />
                  Resolve Aqui
                </Link>
              </div>
            </div>

            {/* Moldura decorativa: referência ao visor da câmera */}
            <div className={styles.visor} aria-hidden="true">
              <span className={styles.visorCanto} data-canto="tl" />
              <span className={styles.visorCanto} data-canto="tr" />
              <span className={styles.visorCanto} data-canto="bl" />
              <span className={styles.visorCanto} data-canto="br" />
              <div className={styles.visorConteudo}>
                <Icon nome="camera" tamanho={30} traco={1.3} />
                <span className={styles.visorLabel}>LENSLAB · READY</span>
                <div className={styles.visorLinhas}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard de estatísticas */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Progresso</span>
            <h2>Seu progresso</h2>
            <p>Estatísticas calculadas a partir da sua atividade no LensLab.</p>
          </div>

          <div className={styles.statsGrid}>
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
      <section className={styles.sectionAlt}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Atalhos</span>
            <h2>O que quer fazer agora?</h2>
          </div>

          <div className={styles.actionGrid}>
            {ATALHOS.map(atalho => (
              <Link key={atalho.to} to={atalho.to} className={styles.actionCard}>
                <span className={styles.actionIcon}>
                  <Icon nome={atalho.icone} tamanho={22} />
                </span>
                <h3>{atalho.titulo}</h3>
                <p>{atalho.texto}</p>
                <span className={styles.actionArrow}>
                  <Icon nome="setaDireita" tamanho={18} />
                </span>
              </Link>
            ))}

            <Link to="/galeria" className={styles.actionCard}>
              <span className={styles.actionIcon}>
                <Icon nome="pasta" tamanho={22} />
              </span>
              <h3>Ver Galeria</h3>
              <p>{totalCapturas > 0
                ? `${totalCapturas} ${totalCapturas === 1 ? 'item' : 'itens'} na sua central de estudo.`
                : 'Comece a capturar seu primeiro material.'}
              </p>
              <span className={styles.actionArrow}>
                <Icon nome="setaDireita" tamanho={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
