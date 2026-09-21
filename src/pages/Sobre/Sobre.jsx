import { CONTAINER } from '../../styles/classes.js'

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
  { nome: 'Tailwind CSS v4', uso: 'Estilização de toda a interface por utilitários' },
  { nome: 'localStorage API', uso: 'Persistência de dados no navegador' },
  { nome: 'MediaDevices API', uso: 'Acesso à webcam na tela de câmera' },
  { nome: 'Canvas API', uso: 'Captura, filtros dos modos e compressão' }
]

/** Cartão de texto das colunas "proposta" e "promessa". */
const CARTAO_TEXTO =
  'rounded-lg border border-line bg-surface p-[1.35rem] transition hover:border-line-2 sm:p-8'

/** Parágrafo padrão dentro desses cartões. */
const PARAGRAFO = 'mb-4 text-[0.9375rem] leading-[1.7] text-ink-2 last:mb-0 [&>strong]:font-semibold [&>strong]:text-ink'

/**
 * Sobre - Página institucional do LensLab
 *
 * Estrutura pai -> filho:
 *   Sobre (pai)
 *     |-- CabecalhoSecao (filho, para Equipe e Stack)
 *     |-- MembroCard (filho, repetido para cada integrante)
 */
function Sobre() {
  return (
    <div className="min-h-[calc(100vh_-_var(--header-h))] bg-bg">
      <section className="relative overflow-hidden border-b border-line pb-12 pt-14">
        <div className="fundo-sobre pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className={CONTAINER}>
          <div className="relative z-[1]">
            <span className="mb-[1.15rem] inline-block rounded-full border border-accent/20 bg-accent/6 px-[0.7rem] py-[0.3rem] font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-accent">
              Sobre o projeto
            </span>
            <h1 className="mb-3 text-[clamp(1.85rem,4vw,2.6rem)] font-bold tracking-[-0.04em]">
              A câmera que <span className="text-accent">ensina</span>.
            </h1>
            <p className="max-w-[58ch] text-base leading-relaxed text-ink-2">
              O LensLab é uma câmera inteligente para estudantes,
              desenvolvida em parceria com a JOVI Smartphone.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-18 pt-12">
        <div className={CONTAINER}>
          <div className="mb-16 grid gap-4 lg:grid-cols-2">
            <article className={CARTAO_TEXTO}>
              <span className="mb-[0.85rem] block font-mono text-[0.6875rem] tracking-[0.14em] text-accent">
                01
              </span>
              <h2 className="mb-4 text-xl tracking-[-0.03em] text-ink">Nossa proposta</h2>
              <p className={PARAGRAFO}>
                Câmeras de celular viraram menus complexos, cheios de modos
                que a maioria dos usuários nunca abre. Ao mesmo tempo, o estudante
                é um público que usa a câmera todo dia — fotografa slides, lousas,
                páginas de livro — mas cujas necessidades específicas nenhum
                aplicativo atende bem.
              </p>
              <p className={PARAGRAFO}>
                O LensLab resolve isso com três modos exclusivos para os três
                momentos da rotina do estudante: <strong>absorver conteúdo</strong>,
                <strong> praticar exercícios</strong> e <strong>compartilhar com privacidade</strong>.
              </p>
              <p className="border-l-2 border-line-2 pl-[0.85rem] text-sm text-ink-3">
                Neste protótipo estão implementados os dois primeiros — Estuda Comigo
                e Resolve Aqui. O modo de privacidade é o escopo da próxima sprint.
              </p>
            </article>

            <article className={CARTAO_TEXTO}>
              <span className="mb-[0.85rem] block font-mono text-[0.6875rem] tracking-[0.14em] text-accent">
                02
              </span>
              <h2 className="mb-4 text-xl tracking-[-0.03em] text-ink">Nossa promessa</h2>
              <p className={PARAGRAFO}>
                Reduzir o tempo entre fotografar material didático e ter
                material de estudo pronto para <strong>menos de 30 segundos</strong>.
              </p>
              <p className={PARAGRAFO}>
                Hoje esse processo leva de 10 a 15 minutos, alternando entre ChatGPT,
                Notion, Quizlet e outros apps. Com o LensLab tudo acontece
                em um lugar só, respeitando o raciocínio do estudante.
              </p>
              <p className="mt-[1.35rem] rounded-sm border border-accent/20 bg-accent/6 px-[1.1rem] py-[0.9rem] italic text-accent">
                "Photomath responde, ChatGPT explica, LensLab ensina."
              </p>
            </article>
          </div>

          <div className="mb-16">
            <CabecalhoSecao
              eyebrow="Equipe"
              titulo="Nossa Equipe"
              texto="Quatro estudantes de Engenharia de Software da FIAP construindo a câmera que gostariam de ter tido durante os próprios estudos."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EQUIPE.map(membro => (
                <MembroCard key={membro.rm} membro={membro} />
              ))}
            </div>
          </div>

          <div>
            <CabecalhoSecao eyebrow="Stack" titulo="Tecnologias utilizadas" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TECNOLOGIAS.map(t => (
                <div
                  key={t.nome}
                  className="rounded-sm border border-line border-l-2 border-l-accent/40 bg-surface px-[1.15rem] py-4 transition hover:border-l-accent hover:bg-surface-2"
                >
                  <strong className="mb-[0.2rem] block text-[0.9375rem] font-semibold tracking-[-0.015em] text-ink">
                    {t.nome}
                  </strong>
                  <span className="text-[0.8125rem] text-ink-3">{t.uso}</span>
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
 * CabecalhoSecao - filho do Sobre: etiqueta, título e linha de apoio.
 */
function CabecalhoSecao({ eyebrow, titulo, texto }) {
  return (
    <div className="mb-8">
      <span className="mb-[0.6rem] block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </span>
      <h2 className="mb-[0.4rem] text-[1.6rem] tracking-[-0.035em] text-ink">{titulo}</h2>
      {texto && <p className="max-w-[62ch] text-[0.9375rem] text-ink-2">{texto}</p>}
    </div>
  )
}

/**
 * MembroCard - filho do Sobre
 */
function MembroCard({ membro }) {
  return (
    <article className="group flex flex-col gap-[0.3rem] rounded-md border border-line bg-surface px-[1.35rem] py-7 text-center transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-surface-2">
      <div
        className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-md border border-accent/20 bg-accent/12 font-mono text-[1.05rem] font-semibold tracking-[0.02em] text-accent transition-colors group-hover:bg-accent/20"
        aria-hidden="true"
      >
        {membro.iniciais}
      </div>
      <h3 className="text-[0.9375rem] leading-[1.35] tracking-[-0.015em] text-ink">{membro.nome}</h3>
      <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-3">{membro.rm}</span>
      <p className="mt-[0.4rem] text-[0.8125rem] font-medium text-accent">{membro.papel}</p>
    </article>
  )
}

export default Sobre
