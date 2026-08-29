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
import styles from './Galeria.module.css'

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
 */
function Galeria() {
  const [notas, setNotas] = useLocalStorage('lenslab_notas', [])
  const [exercicios, setExercicios] = useLocalStorage('lenslab_exercicios', [])
  const [lixeira, setLixeira] = useLocalStorage('lenslab_lixeira', [])
  const { historico, registrar } = useHistorico()

  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroMateria, setFiltroMateria] = useState('todas')
  const [aba, setAba] = useState('conteudo')

  // Mapa de fotos por id, para exibir a miniatura de cada item
  const fotosPorId = useMemo(() => {
    const mapa = {}
    lerLista().forEach(f => { mapa[f.id] = f })
    return mapa
  }, [notas, exercicios, lixeira])

  const todosItens = useMemo(() => {
    const items = [
      ...notas.map(n => ({ ...n, tipo: 'nota' })),
      ...exercicios.map(e => ({ ...e, tipo: 'exercicio' }))
    ]
    return items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }, [notas, exercicios])

  const itensFiltrados = useMemo(() => {
    return todosItens.filter(item => {
      if (filtroTipo === 'notas' && item.tipo !== 'nota') return false
      if (filtroTipo === 'exercicios' && item.tipo !== 'exercicio') return false
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
    if (item.tipo === 'nota') {
      setNotas(notas.filter(n => n.id !== item.id))
    } else {
      setExercicios(exercicios.filter(e => e.id !== item.id))
    }
    setLixeira([{ ...item, removidoEm: Date.now() }, ...lixeira])
    registrar('removido', `${rotulo(item)} de ${item.materia} foi para a lixeira`)
  }

  function restaurar(item) {
    const { removidoEm, ...limpo } = item
    if (item.tipo === 'nota') {
      setNotas([limpo, ...notas])
    } else {
      setExercicios([limpo, ...exercicios])
    }
    setLixeira(lixeira.filter(i => i.id !== item.id))
    registrar('restaurado', `${rotulo(item)} de ${item.materia} foi restaurado`)
  }

  function excluirDefinitivo(item) {
    if (!window.confirm('Excluir permanentemente? Esta ação não pode ser desfeita.')) return

    // A foto só sai junto na exclusão definitiva: enquanto o item está na
    // lixeira ele pode ser restaurado e precisa da miniatura. Sem isso a
    // captura ficaria órfã em lenslab:photos, ocupando cota para sempre.
    if (item.fotoId) excluirFoto(item.fotoId)

    setLixeira(lixeira.filter(i => i.id !== item.id))
    registrar('excluido', `${rotulo(item)} de ${item.materia} foi excluído em definitivo`)
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
    <div className={styles.galeria}>
      <section className={styles.header}>
        <div className={styles.headerFundo} aria-hidden="true" />
        <div className="container">
          <div className={styles.headerContent}>
            <span className={styles.eyebrow}>Central de conteúdo</span>
            <h1>Sua Galeria</h1>
            <p>Tudo que você já processou no LensLab, em um lugar só.</p>
          </div>
        </div>
      </section>

      <section className={styles.stats}>
        <div className="container">
          <div className={styles.statsGrid}>
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

      <section className={styles.abasSecao}>
        <div className="container">
          <div className={styles.abas} role="tablist">
            {abas.map(item => (
              <button
                key={item.id}
                role="tab"
                aria-selected={aba === item.id}
                className={`${styles.aba} ${aba === item.id ? styles.abaAtiva : ''}`}
                onClick={() => setAba(item.id)}
              >
                <Icon nome={item.icone} tamanho={16} />
                {item.label}
                <span className={styles.abaContagem}>{item.contagem}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {aba === 'conteudo' && (
        <>
          <section className={styles.filtros}>
            <div className="container">
              <div className={styles.filtrosContainer}>
                <div className={styles.busca}>
                  <span className={styles.buscaIcone}>
                    <Icon nome="busca" tamanho={17} />
                  </span>
                  <label className={styles.srOnly} htmlFor="busca">Buscar na galeria</label>
                  <input
                    id="busca"
                    type="text"
                    placeholder="Buscar por matéria, conteúdo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className={styles.buscaInput}
                  />
                </div>

                <div className={styles.filtrosGroup}>
                  <label className={styles.srOnly} htmlFor="filtroTipo">Filtrar por tipo</label>
                  <select id="filtroTipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className={styles.filtroSelect}>
                    <option value="todos">Todos os tipos</option>
                    <option value="notas">Só materiais</option>
                    <option value="exercicios">Só exercícios</option>
                  </select>

                  <label className={styles.srOnly} htmlFor="filtroMateria">Filtrar por matéria</label>
                  <select id="filtroMateria" value={filtroMateria} onChange={(e) => setFiltroMateria(e.target.value)} className={styles.filtroSelect}>
                    <option value="todas">Todas as matérias</option>
                    {materiasDisponiveis.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div className={styles.barraContador}>
                <p className={styles.contador}>
                  {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item encontrado' : 'itens encontrados'}
                </p>

                <button
                  className={styles.exemplosBtn}
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

          <section className={styles.lista}>
            <div className="container">
              {itensFiltrados.length === 0 ? (
                <div className={styles.vazio}>
                  <span className={styles.vazioIcone}>
                    <Icon nome="caixaVazia" tamanho={24} />
                  </span>
                  <h3>Nada por aqui ainda</h3>
                  <p>
                    {todosItens.length === 0
                      ? 'Capture seu primeiro material, ou use o botão de dados de exemplo acima para conhecer o produto.'
                      : 'Nenhum item corresponde aos filtros aplicados.'}
                  </p>
                  {todosItens.length === 0 && (
                    <div className={styles.vazioAcoes}>
                      <Link to="/camera" className="btn btn-primary">
                        <Icon nome="camera" />
                        Abrir câmera
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.itensGrid}>
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
        <section className={styles.lista}>
          <div className="container">
            {lixeira.length === 0 ? (
              <div className={styles.vazio}>
                <span className={styles.vazioIcone}>
                  <Icon nome="lixeira" tamanho={24} />
                </span>
                <h3>Lixeira vazia</h3>
                <p>Itens removidos da galeria ficam aqui e podem ser restaurados.</p>
              </div>
            ) : (
              <div className={styles.itensGrid}>
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
        <section className={styles.lista}>
          <div className="container">
            <ListaHistorico historico={historico} />
          </div>
        </section>
      )}
    </div>
  )
}

function rotulo(item) {
  return item.tipo === 'nota' ? 'Material' : 'Exercício'
}

/**
 * ItemCard - filho: card de um material ou exercício ativo
 */
function ItemCard({ item, foto, onRemover }) {
  const [expandido, setExpandido] = useState(false)

  const ehNota = item.tipo === 'nota'
  const tag = ehNota ? 'Material de estudo' : 'Exercício'

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
    <article className={`${styles.item} ${ehNota ? styles.itemNota : styles.itemExercicio}`}>
      {foto && (
        <img src={foto.dataURL} alt={`Captura de ${item.materia}`} className={styles.itemFoto} />
      )}

      <div className={styles.itemHeader}>
        <span className={styles.itemIcone}>
          <Icon nome={ehNota ? 'livro' : 'calculadora'} tamanho={17} />
        </span>
        <div className={styles.itemInfo}>
          <span className={styles.itemTag}>{tag}</span>
          <h3>{item.materia}</h3>
        </div>
        <button
          className={styles.excluirBtn}
          onClick={() => onRemover(item)}
          aria-label={`Mover ${tag.toLowerCase()} de ${item.materia} para a lixeira`}
          title="Mover para a lixeira"
        >
          <Icon nome="lixeira" tamanho={16} />
        </button>
      </div>

      <div className={styles.itemContent}>
        <p className={styles.itemContexto}>
          {item.contexto || item.enunciado || 'Sem contexto adicional.'}
        </p>

        {expandido && (
          <div className={styles.itemDetalhes}>
            {ehNota && item.recursos && (
              <>
                <div className={styles.recurso}>
                  <Icon nome="documento" tamanho={15} />
                  <span>Resumo</span>
                  <strong>{item.recursos.resumo?.topicos?.length || 0} tópicos</strong>
                </div>
                <div className={styles.recurso}>
                  <Icon nome="cartoes" tamanho={15} />
                  <span>Flashcards</span>
                  <strong>{item.recursos.flashcards?.length || 0} cards</strong>
                </div>
                <div className={styles.recurso}>
                  <Icon nome="ajuda" tamanho={15} />
                  <span>Quiz</span>
                  <strong>
                    {item.recursos.quiz?.length || 0} questões
                    {item.resultadoQuiz && (
                      <span className={styles.resultadoQuiz}>{item.resultadoQuiz.acertos}/{item.resultadoQuiz.total}</span>
                    )}
                  </strong>
                </div>
              </>
            )}

            {!ehNota && (
              <>
                <div className={styles.recurso}>
                  <Icon nome="grafico" tamanho={15} />
                  <span>Passos concluídos</span>
                  <strong>{item.passosConcluidos || 0}</strong>
                </div>
                <div className={styles.recurso}>
                  <Icon nome="dica" tamanho={15} />
                  <span>Dicas usadas</span>
                  <strong>{item.dicasUsadas || 0} / 3</strong>
                </div>
                {/* Exercícios salvos antes do cronômetro não têm esse dado */}
                {item.tempoTotalSegundos != null && (
                  <div className={styles.recurso}>
                    <Icon nome="relogio" tamanho={15} />
                    <span>Tempo total</span>
                    <strong>
                      {formatarDuracao(item.tempoTotalSegundos)}
                      {item.limiteSegundos != null && (
                        <span className={styles.limiteTempo}>
                          limite {formatarDuracao(item.limiteSegundos)}/passo
                        </span>
                      )}
                    </strong>
                  </div>
                )}
                <div className={styles.recurso}>
                  <Icon nome="alvo" tamanho={15} />
                  <span>Resultado</span>
                  <strong className={item.acertou ? styles.acertou : styles.errou}>
                    {item.acertou ? 'Acertou' : 'Precisa revisar'}
                  </strong>
                </div>
              </>
            )}

            {modoCaptura && (
              <div className={styles.recurso}>
                <Icon nome={modoCaptura.icone} tamanho={15} />
                <span>Capturado com</span>
                <strong>Modo {modoCaptura.nome}</strong>
              </div>
            )}

            {tamanhoImagem && (
              <div className={styles.recurso}>
                <Icon nome="imagem" tamanho={15} />
                <span>Imagem</span>
                <strong>{tamanhoImagem}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.itemFooter}>
        <span className={styles.itemData}>{item.timestamp ? tempoRelativo(item.timestamp) : 'agora'}</span>
        <button className={styles.detalhesBtn} onClick={() => setExpandido(!expandido)} aria-expanded={expandido}>
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
    <article className={`${styles.item} ${styles.itemRemovido}`}>
      <div className={styles.itemHeader}>
        <span className={styles.itemIcone}>
          <Icon nome={item.tipo === 'nota' ? 'livro' : 'calculadora'} tamanho={17} />
        </span>
        <div className={styles.itemInfo}>
          <span className={styles.itemTag}>{rotulo(item)} removido</span>
          <h3>{item.materia}</h3>
        </div>
      </div>

      <p className={styles.itemContexto}>{item.contexto || item.enunciado}</p>

      <div className={styles.lixeiraAcoes}>
        <button className={styles.restaurarBtn} onClick={() => onRestaurar(item)}>
          <Icon nome="restaurar" tamanho={15} />
          Restaurar
        </button>
        <button className={styles.definitivoBtn} onClick={() => onExcluir(item)}>
          Excluir de vez
        </button>
      </div>

      <div className={styles.itemFooter}>
        <span className={styles.itemData}>Removido {tempoRelativo(item.removidoEm)}</span>
      </div>
    </article>
  )
}

/**
 * ListaHistorico - filho: linha do tempo das ações do usuário
 */
function ListaHistorico({ historico }) {
  const ICONES = { criado: 'mais', removido: 'lixeira', restaurado: 'restaurar', excluido: 'x' }

  if (historico.length === 0) {
    return (
      <div className={styles.vazio}>
        <span className={styles.vazioIcone}>
          <Icon nome="historico" tamanho={24} />
        </span>
        <h3>Sem histórico ainda</h3>
        <p>Tudo que você adicionar, remover ou restaurar aparece aqui.</p>
      </div>
    )
  }

  return (
    <ol className={styles.historico}>
      {historico.map(evento => (
        <li key={evento.id} className={styles.eventoItem} data-acao={evento.acao}>
          <span className={styles.eventoIcone}>
            <Icon nome={ICONES[evento.acao] || 'relogio'} tamanho={15} />
          </span>
          <div className={styles.eventoInfo}>
            <p>{evento.descricao}</p>
            <span className={styles.eventoData}>{tempoRelativo(evento.timestamp)}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default Galeria
