import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { useHistorico } from '../../hooks/useHistorico.js'
import { calcularPercentual, tempoRelativo, formatarDuracao, formatarTamanho } from '../../utils/math-utils.js'
import { lerLista, adicionarVarias, excluir as excluirFoto } from '../../services/photos.js'
import { gerarDadosExemplo } from '../../services/seed.js'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Icon from '../../components/Icon/Icon.jsx'
import { MODOS } from '../../utils/modos-camera.js'
import { CONTAINER, BTN_PRIMARIO } from '../../styles/classes.js'

/** Tom de cor de cada tipo de card, antes a variável --tom no CSS Module. */
const TONS = {
  nota: { filete: 'bg-accent', icone: 'text-accent' },
  exercicio: { filete: 'bg-info', icone: 'text-info' },
  privacidade: { filete: 'bg-warning', icone: 'text-warning' },
  removido: { filete: 'bg-danger', icone: 'text-danger' }
}

/**
 * Os três tipos de item que convivem na galeria. O `titulo` é o que
 * aparece como nome do card: materiais e exercícios usam a matéria, e a
 * foto protegida não tem matéria nenhuma, então usa o próprio rótulo.
 */
const TIPOS = {
  nota: {
    rotulo: 'Material',
    tag: 'Material de estudo',
    icone: 'livro',
    tom: TONS.nota,
    chave: 'notas'
  },
  exercicio: {
    rotulo: 'Exercício',
    tag: 'Exercício',
    icone: 'calculadora',
    tom: TONS.exercicio,
    chave: 'exercicios'
  },
  privacidade: {
    rotulo: 'Foto protegida',
    tag: 'Privacidade',
    icone: 'usuarios',
    tom: TONS.privacidade,
    chave: 'protegidas'
  }
}

/** "Material de Química", "Foto protegida" — usado nas linhas do histórico. */
function descrever(item) {
  const tipo = TIPOS[item.tipo] ?? TIPOS.nota
  return item.materia ? `${tipo.rotulo} de ${item.materia}` : tipo.rotulo
}

/** Moldura comum aos cards de item, da galeria e da lixeira. */
const CARD =
  'group relative flex flex-col gap-4 overflow-hidden rounded-md border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-2 hover:bg-surface-2'

const SELECT =
  'seta-select w-full cursor-pointer rounded-sm border border-line bg-surface py-3 pl-[0.9rem] pr-8 text-sm font-medium text-ink-2 transition hover:border-line-2 hover:text-ink focus:border-line-2 focus:text-ink focus:outline-none sm:w-auto [&>option]:bg-surface-2 [&>option]:text-ink'

const LINHA_RECURSO = 'flex items-center gap-[0.55rem] text-[0.8125rem] text-ink-3 [&>svg]:text-accent'

/**
 * Galeria - Central de conteúdo do estudante
 *
 * Cobre quatro exemplos citados pelo professor:
 *  - Central de conteúdo: visão única com busca geral e itens mais recentes no topo
 *  - Histórico e estatísticas: registro do que foi adicionado, removido e restaurado
 *  - Ações sobre o conteúdo: lixeira com recuperação de itens excluídos
 *  - Organização: filtros por tipo e por matéria
 *
 * Estrutura pai -> filho:
 *   Galeria (pai)
 *     |-- StatCard (filho, repetido)
 *     |-- ItemCard (filho, repetido)
 *     |-- ItemLixeira (filho, repetido)
 *     |-- ListaHistorico (filho)
 *     |-- Vazio (filho, quando não há o que listar)
 */
function Galeria() {
  const [notas, setNotas] = useLocalStorage('lenslab_notas', [])
  const [exercicios, setExercicios] = useLocalStorage('lenslab_exercicios', [])
  const [protegidas, setProtegidas] = useLocalStorage('lenslab_protegidas', [])
  const [lixeira, setLixeira] = useLocalStorage('lenslab_lixeira', [])
  const { historico, registrar } = useHistorico()

  // Uma lista por tipo, para que remover e restaurar funcionem igual
  // para materiais, exercícios e fotos protegidas.
  const LISTAS = {
    nota: [notas, setNotas],
    exercicio: [exercicios, setExercicios],
    privacidade: [protegidas, setProtegidas]
  }

  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroMateria, setFiltroMateria] = useState('todas')
  const [aba, setAba] = useState('conteudo')

  // Mapa de fotos por id, para exibir a miniatura de cada item
  const fotosPorId = useMemo(() => {
    const mapa = {}
    lerLista().forEach(f => { mapa[f.id] = f })
    return mapa
  }, [notas, exercicios, protegidas, lixeira])

  const todosItens = useMemo(() => {
    const items = [
      ...notas.map(n => ({ ...n, tipo: 'nota' })),
      ...exercicios.map(e => ({ ...e, tipo: 'exercicio' })),
      ...protegidas.map(p => ({ ...p, tipo: 'privacidade' }))
    ]
    return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }, [notas, exercicios, protegidas])

  const itensFiltrados = useMemo(() => {
    return todosItens.filter(item => {
      if (filtroTipo === 'notas' && item.tipo !== 'nota') return false
      if (filtroTipo === 'exercicios' && item.tipo !== 'exercicio') return false
      if (filtroTipo === 'privacidade' && item.tipo !== 'privacidade') return false
      // Fotos protegidas não têm matéria, então saem de cena assim que o
      // estudante filtra por uma matéria específica.
      if (filtroMateria !== 'todas' && item.materia !== filtroMateria) return false

      if (busca) {
        const buscaLower = busca.toLowerCase()
        const textoItem = (
          (item.materia || '') + ' ' +
          (item.contexto || '') + ' ' +
          (item.enunciado || '')
        ).toLowerCase()
        if (!textoItem.includes(buscaLower)) return false
      }
      return true
    })
  }, [todosItens, filtroTipo, filtroMateria, busca])

  const materiasDisponiveis = useMemo(() => {
    const set = new Set(todosItens.map(i => i.materia).filter(Boolean))
    return Array.from(set).sort()
  }, [todosItens])

  const totalItens = todosItens.length
  const acertos = exercicios.filter(e => e.acertou).length
  const taxaAcerto = calcularPercentual(acertos, exercicios.length)

  // Evita carregar o mesmo conjunto duas vezes. A lixeira entra na conta
  // porque um exemplo removido continua sendo um exemplo já carregado.
  const exemplosCarregados = todosItens.some(i => i.exemplo) || lixeira.some(i => i.exemplo)

  function moverParaLixeira(item) {
    const [lista, definir] = LISTAS[item.tipo] ?? LISTAS.exercicio
    definir(lista.filter(i => i.id !== item.id))
    setLixeira([{ ...item, removidoEm: Date.now() }, ...lixeira])
    registrar('removido', `${descrever(item)} foi para a lixeira`)
  }

  function restaurar(item) {
    const { removidoEm, ...limpo } = item
    const [lista, definir] = LISTAS[item.tipo] ?? LISTAS.exercicio
    definir([limpo, ...lista])
    setLixeira(lixeira.filter(i => i.id !== item.id))
    registrar('restaurado', `${descrever(item)} foi restaurado`)
  }

  function excluirDefinitivo(item) {
    if (!window.confirm('Excluir permanentemente? Esta ação não pode ser desfeita.')) return

    // A foto só sai junto na exclusão definitiva: enquanto o item está na
    // lixeira ele pode ser restaurado e precisa da miniatura. Sem isso a
    // captura ficaria órfã em lenslab:photos, ocupando cota para sempre.
    if (item.fotoId) excluirFoto(item.fotoId)

    setLixeira(lixeira.filter(i => i.id !== item.id))
    registrar('excluido', `${descrever(item)} foi excluído em definitivo`)
  }

  function carregarExemplos() {
    const { fotos, notas: novasNotas, exercicios: novosExercicios } = gerarDadosExemplo()
    adicionarVarias(fotos)
    setNotas([...novasNotas, ...notas])
    setExercicios([...novosExercicios, ...exercicios])
    registrar('criado', `${novasNotas.length + novosExercicios.length} itens de exemplo foram adicionados`)
  }

  const abas = [
    { id: 'conteudo', label: 'Conteúdo', icone: 'pasta', contagem: totalItens },
    { id: 'lixeira', label: 'Lixeira', icone: 'lixeira', contagem: lixeira.length },
    { id: 'historico', label: 'Histórico', icone: 'historico', contagem: historico.length }
  ]

  return (
    <div className="min-h-[calc(100vh_-_var(--header-h))] bg-bg">
      <section className="relative overflow-hidden border-b border-line pb-12 pt-14">
        <div className="fundo-sobre pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className={CONTAINER}>
          <div className="relative z-[1]">
            <span className="mb-[1.15rem] inline-block rounded-full border border-accent/20 bg-accent/6 px-[0.7rem] py-[0.3rem] font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-accent">
              Central de conteúdo
            </span>
            <h1 className="mb-2 text-[clamp(1.85rem,4vw,2.6rem)] font-bold tracking-[-0.04em]">
              Sua Galeria
            </h1>
            <p className="text-base text-ink-2">
              Tudo que você já processou no LensLab, em um lugar só.
            </p>
          </div>
        </div>
      </section>

      <section className="pt-8">
        <div className={CONTAINER}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icone="pasta" titulo="Total de itens" valor={totalItens} descricao="na sua galeria" cor="primary" />
            <StatCard icone="livro" titulo="Materiais de estudo" valor={notas.length} descricao="do Estuda Comigo" cor="info" />
            <StatCard icone="calculadora" titulo="Exercícios" valor={exercicios.length} descricao="do Resolve Aqui" cor="success" />
            <StatCard
              icone="alvo"
              titulo="Taxa de acerto"
              valor={exercicios.length > 0 ? `${taxaAcerto}%` : '—'}
              descricao={exercicios.length > 0 ? `${acertos} de ${exercicios.length} certos` : 'sem exercícios ainda'}
              cor="warning"
            />
          </div>
        </div>
      </section>

      <section className="pt-8">
        <div className={CONTAINER}>
          <div className="flex flex-wrap gap-1 border-b border-line" role="tablist">
            {abas.map(item => {
              const ativa = aba === item.id
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={ativa}
                  className={`-mb-px inline-flex items-center gap-2 border-b-2 px-[0.6rem] py-[0.65rem] text-[0.85rem] font-medium transition sm:px-[0.9rem] sm:py-[0.7rem] sm:text-[0.9rem] ${
                    ativa ? 'border-accent text-accent' : 'border-transparent text-ink-3 hover:text-ink'
                  }`}
                  onClick={() => setAba(item.id)}
                >
                  <Icon nome={item.icone} tamanho={16} />
                  {item.label}
                  <span
                    className={`rounded-full px-[0.4rem] py-[0.1rem] font-mono text-[0.6875rem] ${
                      ativa ? 'bg-accent/12 text-accent' : 'bg-white/6 text-ink-3'
                    }`}
                  >
                    {item.contagem}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {aba === 'conteudo' && (
        <>
          <section className="pb-2 pt-7">
            <div className={CONTAINER}>
              <div className="flex flex-col flex-wrap items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[240px] flex-1">
                  <span className="pointer-events-none absolute left-[0.9rem] top-1/2 grid -translate-y-1/2 place-items-center text-ink-3">
                    <Icon nome="busca" tamanho={17} />
                  </span>
                  <label className="sr-only" htmlFor="busca">Buscar na galeria</label>
                  <input
                    id="busca"
                    type="text"
                    placeholder="Buscar por matéria, conteúdo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full rounded-sm border border-line bg-surface py-3 pl-[2.65rem] pr-4 text-[0.9375rem] text-ink transition placeholder:text-ink-3 focus:border-accent/40 focus:shadow-[0_0_0_3px_var(--accent-06)] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col flex-wrap gap-2 sm:flex-row">
                  <label className="sr-only" htmlFor="filtroTipo">Filtrar por tipo</label>
                  <select id="filtroTipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={SELECT}>
                    <option value="todos">Todos os tipos</option>
                    <option value="notas">Só materiais</option>
                    <option value="exercicios">Só exercícios</option>
                    <option value="privacidade">Só fotos protegidas</option>
                  </select>

                  <label className="sr-only" htmlFor="filtroMateria">Filtrar por matéria</label>
                  <select id="filtroMateria" value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)} className={SELECT}>
                    <option value="todas">Todas as matérias</option>
                    {materiasDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <p className="font-mono text-xs tracking-[0.04em] text-ink-3">
                  {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item encontrado' : 'itens encontrados'}
                </p>

                <button
                  className="inline-flex items-center gap-[0.4rem] rounded-sm border border-line bg-white/[0.02] px-[0.8rem] py-[0.4rem] text-[0.8125rem] font-medium text-ink-2 transition disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:border-accent/40 enabled:hover:bg-accent/6 enabled:hover:text-accent"
                  onClick={carregarExemplos}
                  disabled={exemplosCarregados}
                  title={exemplosCarregados
                    ? 'Os dados de exemplo já foram carregados'
                    : 'Cria quatro itens de demonstração na galeria'}
                >
                  <Icon nome="mais" tamanho={15} />
                  {exemplosCarregados ? 'Exemplos já carregados' : 'Carregar dados de exemplo'}
                </button>
              </div>
            </div>
          </section>

          <section className="pb-16 pt-5">
            <div className={CONTAINER}>
              {itensFiltrados.length === 0 ? (
                <Vazio
                  icone="caixaVazia"
                  titulo="Nada por aqui ainda"
                  texto={
                    todosItens.length === 0
                      ? 'Capture seu primeiro material, ou use o botão de dados de exemplo acima para conhecer o produto.'
                      : 'Nenhum item corresponde aos filtros aplicados.'
                  }
                >
                  {todosItens.length === 0 && (
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link to="/camera" className={BTN_PRIMARIO}>
                        <Icon nome="camera" />
                        Abrir câmera
                      </Link>
                    </div>
                  )}
                </Vazio>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
                  {itensFiltrados.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      foto={fotosPorId[item.fotoId]}
                      onRemover={moverParaLixeira}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {aba === 'lixeira' && (
        <section className="pb-16 pt-5">
          <div className={CONTAINER}>
            {lixeira.length === 0 ? (
              <Vazio
                icone="lixeira"
                titulo="Lixeira vazia"
                texto="Itens removidos da galeria ficam aqui e podem ser restaurados."
              />
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
                {lixeira.map(item => (
                  <ItemLixeira
                    key={item.id}
                    item={item}
                    onRestaurar={restaurar}
                    onExcluir={excluirDefinitivo}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {aba === 'historico' && (
        <section className="pb-16 pt-5">
          <div className={CONTAINER}>
            <ListaHistorico historico={historico} />
          </div>
        </section>
      )}
    </div>
  )
}


/**
 * ItemCard - filho: card de um material ou exercício ativo
 */
function ItemCard({ item, foto, onRemover }) {
  const [expandido, setExpandido] = useState(false)

  const ehNota = item.tipo === 'nota'
  const ehPrivacidade = item.tipo === 'privacidade'
  const tipo = TIPOS[item.tipo] ?? TIPOS.exercicio
  const tom = tipo.tom

  // Só as capturas reais são base64; as imagens do seed são caminhos de
  // arquivo e não têm um tamanho que faça sentido exibir.
  const ehCaptura = foto?.dataURL?.startsWith('data:')
  const tamanhoImagem = ehCaptura
    ? formatarTamanho(Math.round(foto.dataURL.length * 0.75))
    : null

  // Modo da câmera usado na captura, quando o item veio de uma foto
  const modoCaptura = foto?.modoCaptura && foto.modoCaptura !== 'foto'
    ? MODOS[foto.modoCaptura]
    : null

  return (
    <article className={CARD}>
      <Filete tom={tom.filete} />

      {foto && (
        <img
          src={foto.dataURL}
          alt={`Captura de ${item.materia}`}
          className="h-[140px] w-full rounded-sm border border-line object-cover"
        />
      )}

      <div className="flex items-start gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xs bg-white/5 ${tom.icone}`}>
          <Icon nome={tipo.icone} tamanho={17} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="mb-1 block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
            {tipo.tag}
          </span>
          <h3 className="text-base tracking-[-0.02em] text-ink">{item.materia || tipo.rotulo}</h3>
        </div>
        <button
          className="grid h-[30px] w-[30px] place-items-center rounded-xs text-ink-3 transition hover:bg-danger/10 hover:text-danger"
          onClick={() => onRemover(item)}
          aria-label={`Mover ${descrever(item).toLowerCase()} para a lixeira`}
          title="Mover para a lixeira"
        >
          <Icon nome="lixeira" tamanho={16} />
        </button>
      </div>

      <div className="flex-1">
        <p className="line-clamp-3 text-sm leading-[1.55] text-ink-2">
          {item.contexto || item.enunciado || 'Sem contexto adicional.'}
        </p>

        {expandido && (
          <div className="animate-surgir mt-4 flex flex-col gap-[0.6rem] border-t border-line pt-4">
            {ehNota && item.recursos && (
              <>
                <div className={LINHA_RECURSO}>
                  <Icon nome="documento" tamanho={15} />
                  <span>Resumo</span>
                  <strong className="ml-auto font-semibold text-ink">
                    {item.recursos.resumo?.topicos?.length || 0} tópicos
                  </strong>
                </div>
                <div className={LINHA_RECURSO}>
                  <Icon nome="cartoes" tamanho={15} />
                  <span>Flashcards</span>
                  <strong className="ml-auto font-semibold text-ink">
                    {item.recursos.flashcards?.length || 0} cards
                  </strong>
                </div>
                <div className={LINHA_RECURSO}>
                  <Icon nome="ajuda" tamanho={15} />
                  <span>Quiz</span>
                  <strong className="ml-auto font-semibold text-ink">
                    {item.recursos.quiz?.length || 0} questões
                    {item.resultadoQuiz && (
                      <span className="ml-[0.4rem] font-mono text-accent">
                        {item.resultadoQuiz.acertos}/{item.resultadoQuiz.total}
                      </span>
                    )}
                  </strong>
                </div>
              </>
            )}

            {ehPrivacidade && (
              <>
                <div className={LINHA_RECURSO}>
                  <Icon nome="usuarios" tamanho={15} />
                  <span>Rostos desfocados</span>
                  <strong className="ml-auto font-semibold text-ink">
                    {item.rostosDesfocados ?? 0} de {item.totalRostos ?? 0}
                  </strong>
                </div>
                {item.intensidade != null && (
                  <div className={LINHA_RECURSO}>
                    <Icon nome="brilho" tamanho={15} />
                    <span>Intensidade do desfoque</span>
                    <strong className="ml-auto font-semibold text-ink">
                      {item.intensidade}/10
                    </strong>
                  </div>
                )}
              </>
            )}

            {item.tipo === 'exercicio' && (
              <>
                <div className={LINHA_RECURSO}>
                  <Icon nome="grafico" tamanho={15} />
                  <span>Passos concluídos</span>
                  <strong className="ml-auto font-semibold text-ink">{item.passosConcluidos || 0}</strong>
                </div>
                <div className={LINHA_RECURSO}>
                  <Icon nome="dica" tamanho={15} />
                  <span>Dicas usadas</span>
                  <strong className="ml-auto font-semibold text-ink">{item.dicasUsadas || 0} / 3</strong>
                </div>
                {/* Exercícios salvos antes do cronômetro não têm esse dado */}
                {item.tempoTotalSegundos != null && (
                  <div className={LINHA_RECURSO}>
                    <Icon nome="relogio" tamanho={15} />
                    <span>Tempo total</span>
                    <strong className="ml-auto font-semibold text-ink">
                      {formatarDuracao(item.tempoTotalSegundos)}
                      {item.limiteSegundos != null && (
                        <span className="ml-[0.45rem] font-mono text-[0.6875rem] font-normal text-ink-3">
                          limite {formatarDuracao(item.limiteSegundos)}/passo
                        </span>
                      )}
                    </strong>
                  </div>
                )}
                <div className={LINHA_RECURSO}>
                  <Icon nome="alvo" tamanho={15} />
                  <span>Resultado</span>
                  <strong className={`ml-auto font-semibold ${item.acertou ? 'text-accent' : 'text-warning'}`}>
                    {item.acertou ? 'Acertou' : 'Precisa revisar'}
                  </strong>
                </div>
              </>
            )}

            {modoCaptura && (
              <div className={LINHA_RECURSO}>
                <Icon nome={modoCaptura.icone} tamanho={15} />
                <span>Capturado com</span>
                <strong className="ml-auto font-semibold text-ink">Modo {modoCaptura.nome}</strong>
              </div>
            )}

            {tamanhoImagem && (
              <div className={LINHA_RECURSO}>
                <Icon nome="imagem" tamanho={15} />
                <span>Imagem</span>
                <strong className="ml-auto font-semibold text-ink">{tamanhoImagem}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line pt-[0.85rem]">
        <span className="font-mono text-[0.6875rem] text-ink-3">
          {item.timestamp ? tempoRelativo(item.timestamp) : 'agora'}
        </span>
        <button
          className="inline-flex items-center gap-[0.35rem] rounded-xs px-[0.4rem] py-1 text-[0.8125rem] font-medium text-ink-2 transition hover:bg-accent/6 hover:text-accent"
          onClick={() => setExpandido(!expandido)}
          aria-expanded={expandido}
        >
          {expandido ? 'Menos' : 'Detalhes'}
          <Icon nome={expandido ? 'chevronCima' : 'chevronBaixo'} tamanho={14} />
        </button>
      </div>
    </article>
  )
}

/**
 * ItemLixeira - filho: card de um item removido, com restaurar e excluir
 */
function ItemLixeira({ item, onRestaurar, onExcluir }) {
  return (
    <article className={CARD}>
      <Filete tom={TONS.removido.filete} />

      <div className="flex items-start gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xs bg-white/5 ${TONS.removido.icone}`}>
          <Icon nome={(TIPOS[item.tipo] ?? TIPOS.exercicio).icone} tamanho={17} />
        </span>
        <div className="min-w-0 flex-1">
          <span className="mb-1 block font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ink-3">
            {(TIPOS[item.tipo] ?? TIPOS.exercicio).rotulo} removido
          </span>
          <h3 className="text-base tracking-[-0.02em] text-ink">
            {item.materia || (TIPOS[item.tipo] ?? TIPOS.exercicio).rotulo}
          </h3>
        </div>
      </div>

      <p className="line-clamp-3 text-sm leading-[1.55] text-ink-2">
        {item.contexto || item.enunciado}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          className="inline-flex flex-1 items-center justify-center gap-[0.45rem] rounded-sm border border-accent/20 bg-accent/6 px-4 py-[0.55rem] text-sm font-medium text-accent transition hover:border-accent/40 hover:bg-accent/12"
          onClick={() => onRestaurar(item)}
        >
          <Icon nome="restaurar" tamanho={15} />
          Restaurar
        </button>
        <button
          className="rounded-sm border border-transparent px-4 py-[0.55rem] text-sm font-medium text-ink-3 transition hover:bg-danger/8 hover:text-danger"
          onClick={() => onExcluir(item)}
        >
          Excluir de vez
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-line pt-[0.85rem]">
        <span className="font-mono text-[0.6875rem] text-ink-3">
          Removido {tempoRelativo(item.removidoEm)}
        </span>
      </div>
    </article>
  )
}

/**
 * ListaHistorico - filho: linha do tempo das ações do usuário
 */
function ListaHistorico({ historico }) {
  const ICONES = { criado: 'mais', removido: 'lixeira', restaurado: 'restaurar', excluido: 'x' }
  const TONS_EVENTO = {
    criado: 'bg-accent/12 text-accent',
    restaurado: 'bg-info/12 text-info',
    excluido: 'bg-danger/12 text-danger'
  }

  if (historico.length === 0) {
    return (
      <Vazio
        icone="historico"
        titulo="Sem histórico ainda"
        texto="Tudo que você adicionar, remover ou restaurar aparece aqui."
      />
    )
  }

  return (
    <ol className="flex flex-col rounded-lg border border-line bg-surface px-[1.15rem] py-2 sm:px-6">
      {historico.map(evento => (
        <li
          key={evento.id}
          className="flex items-start gap-[0.9rem] border-b border-line py-4 last:border-b-0"
        >
          <span
            className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-xs ${
              TONS_EVENTO[evento.acao] || 'bg-white/5 text-ink-3'
            }`}
          >
            <Icon nome={ICONES[evento.acao] || 'relogio'} tamanho={15} />
          </span>
          <div>
            <p className="text-[0.9rem] leading-[1.45] text-ink">{evento.descricao}</p>
            <span className="font-mono text-[0.6875rem] text-ink-3">
              {tempoRelativo(evento.timestamp)}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Filete - filho dos cards: a linha de cor no topo, acesa no hover.
 */
function Filete({ tom }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 h-px opacity-35 transition-opacity group-hover:opacity-100 ${tom}`}
    />
  )
}

/**
 * Vazio - filho: o mesmo bloco pontilhado usado nas três abas sem conteúdo.
 */
function Vazio({ icone, titulo, texto, children }) {
  return (
    <div className="rounded-lg border border-dashed border-line-2 bg-surface px-8 py-16 text-center">
      <span className="mx-auto mb-[1.1rem] grid h-[52px] w-[52px] place-items-center rounded-md bg-white/[0.04] text-ink-3">
        <Icon nome={icone} tamanho={24} />
      </span>
      <h3 className="mb-[0.4rem] text-[1.15rem] tracking-[-0.025em] text-ink">{titulo}</h3>
      <p className="mx-auto mb-7 max-w-[46ch] text-[0.9375rem] text-ink-2">{texto}</p>
      {children}
    </div>
  )
}

export default Galeria
