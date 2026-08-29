import styles from './Sobre.module.css'

const EQUIPE = [
  {
    iniciais: 'MS',
    nome: 'Marcelo Antônio Scoleso Junior',
    rm: 'RM 571626',
    papel: 'Front-End & Web Development'
  },
  {
    iniciais: 'JO',
    nome: 'João Paulo Francisco de Oliveira',
    rm: 'RM 571306',
    papel: 'Storytelling & Comunicação'
  },
  {
    iniciais: 'JM',
    nome: 'Julia Souza Matarazzo',
    rm: 'RM 571340',
    papel: 'Total Experience Design'
  },
  {
    iniciais: 'GS',
    nome: 'Gabriel Souza Alexandre Silva',
    rm: 'RM 572607',
    papel: 'Lógica & Simulação'
  }
]

const TECNOLOGIAS = [
  { nome: 'React 18 + Vite', uso: 'Interface e build do protótipo web' },
  { nome: 'React Router v6', uso: 'Navegação entre páginas' },
  { nome: 'CSS Modules', uso: 'Estilização encapsulada por componente' },
  { nome: 'localStorage API', uso: 'Persistência de dados no navegador' },
  { nome: 'MediaDevices API', uso: 'Acesso à webcam na tela de câmera' },
  { nome: 'Canvas API', uso: 'Captura, filtros dos modos e compressão' }
]

/**
 * Sobre - Página institucional do LensLab
 *
 * Estrutura pai -> filho:
 *   Sobre (pai)
 *     |-- MembroCard (filho, repetido para cada integrante)
 */
function Sobre() {
  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerFundo} aria-hidden="true" />
        <div className="container">
          <div className={styles.headerConteudo}>
            <span className={styles.eyebrow}>Sobre o projeto</span>
            <h1>A câmera que <span className={styles.highlight}>ensina</span>.</h1>
            <p>
              O LensLab é uma câmera inteligente para estudantes,
              desenvolvida em parceria com a JOVI Smartphone.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          <div className={styles.grid}>
            <article className={styles.textoCard}>
              <span className={styles.cardLabel}>01</span>
              <h2>Nossa proposta</h2>
              <p>
                Câmeras de celular viraram menus complexos, cheios de modos
                que a maioria dos usuários nunca abre. Ao mesmo tempo, o estudante
                é um público que usa a câmera todo dia — fotografa slides, lousas,
                páginas de livro — mas cujas necessidades específicas nenhum
                aplicativo atende bem.
              </p>
              <p>
                O LensLab resolve isso com três modos exclusivos para os três
                momentos da rotina do estudante: <strong>absorver conteúdo</strong>,
                <strong> praticar exercícios</strong> e <strong>compartilhar com privacidade</strong>.
              </p>
              <p className={styles.escopo}>
                Neste protótipo estão implementados os dois primeiros — Estuda Comigo
                e Resolve Aqui. O modo de privacidade é o escopo da próxima sprint.
              </p>
            </article>

            <article className={styles.textoCard}>
              <span className={styles.cardLabel}>02</span>
              <h2>Nossa promessa</h2>
              <p>
                Reduzir o tempo entre fotografar material didático e ter
                material de estudo pronto para <strong>menos de 30 segundos</strong>.
              </p>
              <p>
                Hoje esse processo leva de 10 a 15 minutos, alternando entre ChatGPT,
                Notion, Quizlet e outros apps. Com o LensLab tudo acontece
                em um lugar só, respeitando o raciocínio do estudante.
              </p>
              <p className={styles.slogan}>
                "Photomath responde, ChatGPT explica, LensLab ensina."
              </p>
            </article>
          </div>

          <div className={styles.equipeSection}>
            <div className={styles.secaoHeader}>
              <span className={styles.secaoEyebrow}>Equipe</span>
              <h2>Nossa Equipe</h2>
              <p>Quatro estudantes de Engenharia de Software da FIAP construindo a câmera que gostariam de ter tido durante os próprios estudos.</p>
            </div>

            <div className={styles.equipeGrid}>
              {EQUIPE.map(membro => (
                <MembroCard key={membro.rm} membro={membro} />
              ))}
            </div>
          </div>

          <div className={styles.tecnologiasSection}>
            <div className={styles.secaoHeader}>
              <span className={styles.secaoEyebrow}>Stack</span>
              <h2>Tecnologias utilizadas</h2>
            </div>
            <div className={styles.tecnologiasGrid}>
              {TECNOLOGIAS.map(t => (
                <div key={t.nome} className={styles.tecItem}>
                  <strong>{t.nome}</strong>
                  <span>{t.uso}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/**
 * MembroCard - filho do Sobre
 */
function MembroCard({ membro }) {
  return (
    <article className={styles.membroCard}>
      <div className={styles.avatar} aria-hidden="true">{membro.iniciais}</div>
      <h3>{membro.nome}</h3>
      <span className={styles.rm}>{membro.rm}</span>
      <p className={styles.papel}>{membro.papel}</p>
    </article>
  )
}

export default Sobre
