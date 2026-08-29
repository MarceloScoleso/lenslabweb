import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { obter } from '../../services/photos.js'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'
import { gerarPassos } from '../../utils/ia-mock.js'
import { gerarId, tempoAleatorio, formatarDuracao, arredondar } from '../../utils/math-utils.js'
import Icon from '../../components/Icon/Icon.jsx'
import { MODOS } from '../../utils/modos-camera.js'
import styles from './ResolveAqui.module.css'

const MATERIAS = ['Matemática', 'Física', 'Química', 'Biologia']
const MAX_DICAS = 3

/**
 * Tempo que o estudante escolhe para cada passo antes de começar.
 * `null` significa sem limite: o cronômetro continua medindo o ritmo,
 * mas não há contagem regressiva nem alerta.
 */
const OPCOES_TEMPO = [
  { rotulo: 'Sem limite', segundos: null },
  { rotulo: '1 min', segundos: 60 },
  { rotulo: '2 min', segundos: 120 },
  { rotulo: '3 min', segundos: 180 },
  { rotulo: '5 min', segundos: 300 }
]

function somarTempos(acoes) {
  return acoes.reduce((total, item) => total + (item.segundos || 0), 0)
}

/**
 * ResolveAqui - Modo de resolução guiada
 *
 * Fluxo em 4 estados:
 *   1. captura     -> matéria + enunciado
 *   2. processando -> gera os passos
 *   3. resolvendo  -> navega passo a passo, com dicas limitadas
 *   4. resultado   -> resumo da sessão e confirmação
 *
 * Estrutura pai -> filho:
 *   ResolveAqui (pai)
 *     |-- FormularioExercicio (filho)
 *     |-- TelaProcessando (filho)
 *     |-- PassoAtual (filho)
 *     |-- ResultadoFinal (filho)
 */
function ResolveAqui() {
  const navigate = useNavigate()
  const location = useLocation()
  const [exercicios, setExercicios] = useLocalStorage('lenslab_exercicios', [])

  // Foto vinda da tela de câmera, quando o usuário chegou por lá
  const fotoId = location.state?.fotoId || null
  const foto = useMemo(() => (fotoId ? obter(fotoId) : null), [fotoId])

  const [etapa, setEtapa] = useState('captura')
  const [materia, setMateria] = useState('')
  const [enunciado, setEnunciado] = useState('')
  const [passos, setPassos] = useState([])
  const [passoAtual, setPassoAtual] = useState(0)
  const [acoesUsuario, setAcoesUsuario] = useState([])
  const [dicasUsadas, setDicasUsadas] = useState(0)
  const [limiteSegundos, setLimiteSegundos] = useState(null)
  const [tempoProcessamento, setTempoProcessamento] = useState(0)

  function iniciarResolucao() {
    if (!materia || enunciado.length < 10) return

    setEtapa('processando')
    const inicioTempo = Date.now()

    setTimeout(() => {
      setPassos(gerarPassos(materia, enunciado))
      setPassoAtual(0)
      setAcoesUsuario([])
      setDicasUsadas(0)
      // Mesmo dado que o Estuda Comigo grava: quanto a "IA" levou para
      // preparar o material. É o que alimenta o Tempo médio da Home.
      setTempoProcessamento(Date.now() - inicioTempo)
      setEtapa('resolvendo')
    }, tempoAleatorio(1200, 2200))
  }

  function registrarAcao(acao, segundos) {
    setAcoesUsuario([...acoesUsuario, { passo: passoAtual + 1, acao, segundos }])
    if (passoAtual + 1 < passos.length) {
      setPassoAtual(passoAtual + 1)
    } else {
      setEtapa('resultado')
    }
  }

  function usarDica() {
    if (dicasUsadas < MAX_DICAS) {
      setDicasUsadas(dicasUsadas + 1)
    }
  }

  function salvarResultado(acertou) {
    const exercicioSalvo = {
      id: gerarId('exercicio'),
      materia,
      enunciado,
      fotoId,
      passosConcluidos: passos.length,
      dicasUsadas,
      acertou,
      acoes: acoesUsuario,
      limiteSegundos,
      tempoTotalSegundos: somarTempos(acoesUsuario),
      tempoProcessamento,
      timestamp: Date.now()
    }
    setExercicios([exercicioSalvo, ...exercicios])
    navigate('/galeria')
  }

  function reiniciar() {
    setEtapa('captura')
    setMateria('')
    setEnunciado('')
    setPassos([])
    setPassoAtual(0)
    setAcoesUsuario([])
    setDicasUsadas(0)
  }

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerFundo} aria-hidden="true" />
        <div className="container">
          <div className={styles.headerConteudo}>
            <span className={styles.eyebrow}>Modo Resolve Aqui</span>
            <h1>Resolva com <span className={styles.highlight}>orientação</span>, não com a resposta pronta</h1>
            <p>Fotografe seu exercício. O LensLab te guia passo a passo, respeitando seu raciocínio.</p>
            <p className={styles.filosofia}>
              "Photomath responde, ChatGPT explica, LensLab ensina."
            </p>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          {etapa === 'captura' && (
            <FormularioExercicio
              foto={foto}
              materia={materia}
              setMateria={setMateria}
              enunciado={enunciado}
              setEnunciado={setEnunciado}
              limiteSegundos={limiteSegundos}
              setLimiteSegundos={setLimiteSegundos}
              onEnviar={iniciarResolucao}
            />
          )}

          {etapa === 'processando' && <TelaProcessando />}

          {etapa === 'resolvendo' && passos.length > 0 && (
            <PassoAtual
              key={passoAtual}
              passo={passos[passoAtual]}
              numeroAtual={passoAtual + 1}
              totalPassos={passos.length}
              limiteSegundos={limiteSegundos}
              tempoProcessamento={tempoProcessamento}
              dicasUsadas={dicasUsadas}
              maxDicas={MAX_DICAS}
              onRegistrarAcao={registrarAcao}
              onPedirDica={usarDica}
            />
          )}

          {etapa === 'resultado' && (
            <ResultadoFinal
              materia={materia}
              acoesUsuario={acoesUsuario}
              dicasUsadas={dicasUsadas}
              limiteSegundos={limiteSegundos}
              totalPassos={passos.length}
              onSalvar={salvarResultado}
              onReiniciar={reiniciar}
            />
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * FormularioExercicio - filho: entrada do exercício
 */
function FormularioExercicio({ foto, materia, setMateria, enunciado, setEnunciado, limiteSegundos, setLimiteSegundos, onEnviar }) {
  return (
    <div className={styles.card}>
      {foto ? (
        <div className={styles.cardTopo}>
          <img src={foto.dataURL} alt="Exercício capturado" className={styles.fotoCapturada} />
          <ModoDaCaptura slug={foto.modoCaptura} />
          <h2>Confirme o enunciado</h2>
          <p className={styles.cardDescricao}>
            Este é o exercício que você fotografou. Escolha a matéria e digite
            o enunciado que aparece na imagem.
          </p>
        </div>
      ) : (
        <div className={styles.cardTopo}>
          <span className={styles.cardIcone}>
            <Icon nome="calculadora" tamanho={22} />
          </span>
          <h2>Envie seu exercício</h2>
          <p className={styles.cardDescricao}>
            Escolha a matéria e digite o enunciado, ou{' '}
            <Link to="/camera" className={styles.linkCamera}>abra a câmera</Link>{' '}
            para fotografar o exercício.
          </p>
        </div>
      )}

      <div className={styles.formGroup}>
        <span className={styles.groupLabel}>Matéria</span>
        <div className={styles.materiaGrid}>
          {MATERIAS.map(m => (
            <button
              key={m}
              type="button"
              className={`${styles.materiaBtn} ${materia === m ? styles.materiaAtiva : ''}`}
              onClick={() => setMateria(m)}
              aria-pressed={materia === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="enunciado">Enunciado do exercício</label>
        <textarea
          id="enunciado"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          rows={5}
          placeholder="Ex: Calcule a velocidade final de um corpo em queda livre após 3 segundos, considerando g = 10 m/s²..."
          className={styles.textarea}
        />
        <small className={styles.helperText}>
          {enunciado.length} caracteres (mínimo 10)
        </small>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.groupLabel}>Tempo por passo</span>
        <div className={styles.tempoGrid}>
          {OPCOES_TEMPO.map(opcao => (
            <button
              key={opcao.rotulo}
              type="button"
              className={`${styles.tempoBtn} ${limiteSegundos === opcao.segundos ? styles.tempoAtivo : ''}`}
              onClick={() => setLimiteSegundos(opcao.segundos)}
              aria-pressed={limiteSegundos === opcao.segundos}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
        <small className={styles.helperText}>
          O cronômetro mede o seu ritmo em cada passo e nunca interrompe a
          resolução: se o tempo acabar, você continua de onde parou.
        </small>
      </div>

      <button
        onClick={onEnviar}
        className={`btn btn-primary ${styles.btnBloco}`}
        disabled={!materia || enunciado.length < 10}
      >
        <Icon nome="alvo" />
        Começar resolução guiada
      </button>
    </div>
  )
}

/**
 * ModoDaCaptura - filho: mostra em que modo da câmera a foto foi tirada
 */
function ModoDaCaptura({ slug }) {
  const modo = slug && MODOS[slug]
  if (!modo || slug === 'foto') return null

  return (
    <span className={styles.modoCaptura} style={{ '--tom-modo': modo.cor }}>
      <Icon nome={modo.icone} tamanho={14} />
      Capturado no modo {modo.nome}
    </span>
  )
}

/**
 * TelaProcessando - filho: animação de análise
 */
function TelaProcessando() {
  return (
    <div className={`${styles.card} ${styles.processandoCard}`}>
      <span className={styles.processandoIcone}>
        <Icon nome="processador" tamanho={26} />
      </span>
      <h2>Analisando o exercício...</h2>
      <p className={styles.cardDescricao}>Identificando os passos ideais para você resolver.</p>
      <div className={styles.progressBar}>
        <div className={styles.progressFill}></div>
      </div>
    </div>
  )
}

/**
 * PassoAtual - filho: mostra o passo atual e coleta a ação do estudante
 */
function PassoAtual({ passo, numeroAtual, totalPassos, limiteSegundos, tempoProcessamento, dicasUsadas, maxDicas, onRegistrarAcao, onPedirDica }) {
  const [acao, setAcao] = useState('')
  const [dicaVisivel, setDicaVisivel] = useState(false)
  const [segundos, setSegundos] = useState(0)

  // Um cronômetro por passo: o componente é remontado a cada passo (prop key
  // no pai), então a contagem sempre recomeça do zero.
  useEffect(() => {
    const intervalo = setInterval(() => setSegundos(atual => atual + 1), 1000)
    return () => clearInterval(intervalo)
  }, [])

  function pedirDica() {
    if (dicasUsadas < maxDicas) {
      onPedirDica()
      setDicaVisivel(true)
    }
  }

  function confirmar() {
    if (acao.trim().length < 3) return
    onRegistrarAcao(acao.trim(), segundos)
    setAcao('')
    setDicaVisivel(false)
  }

  const dicasRestantes = maxDicas - dicasUsadas

  // Sem limite o cronômetro só conta para cima; com limite ele vira uma
  // contagem regressiva que, ao zerar, passa a mostrar o tempo excedente.
  const restante = limiteSegundos === null ? null : limiteSegundos - segundos
  const estourou = restante !== null && restante <= 0
  const atencao = restante !== null && !estourou && restante <= Math.max(10, Math.round(limiteSegundos * 0.2))
  const estadoTempo = estourou ? 'estourado' : atencao ? 'atencao' : 'normal'

  const textoTempo = limiteSegundos === null
    ? formatarDuracao(segundos)
    : estourou
      ? `+${formatarDuracao(segundos - limiteSegundos)}`
      : formatarDuracao(restante)

  const rotuloTempo = limiteSegundos === null
    ? `Tempo neste passo: ${textoTempo}`
    : estourou
      ? `Tempo do passo esgotado há ${formatarDuracao(segundos - limiteSegundos)}`
      : `Tempo restante neste passo: ${textoTempo}`

  return (
    <div className={styles.passoContainer}>
      {/* A promessa dos 30 segundos vale para os dois modos: aqui ela
          aparece no instante em que a resolução fica pronta. */}
      {numeroAtual === 1 && tempoProcessamento > 0 && (
        <p className={styles.geracaoBanner}>
          <Icon nome="raio" tamanho={15} />
          Resolução preparada em <strong>{arredondar(tempoProcessamento / 1000, 1)}s</strong>
          <span>bem abaixo da meta de 30 segundos</span>
        </p>
      )}

      <div className={styles.passoHeader}>
        <span className={styles.passoNumero}>Passo {numeroAtual} de {totalPassos}</span>
        <div className={styles.medidores}>
          <div
            className={styles.cronometro}
            data-estado={estadoTempo}
            role="timer"
            aria-label={rotuloTempo}
            title={rotuloTempo}
          >
            <Icon nome="relogio" tamanho={15} />
            <strong>{textoTempo}</strong>
            {estourou && <span className={styles.esgotado}>esgotado</span>}
          </div>
          <div className={styles.dicasCounter}>
            <Icon nome="dica" tamanho={15} />
            Dicas restantes <strong>{dicasRestantes}</strong>
          </div>
        </div>
      </div>

      <div className={styles.passoProgressBar}>
        <div
          className={styles.passoProgressFill}
          style={{ width: `${(numeroAtual / totalPassos) * 100}%` }}
        />
      </div>

      <div className={styles.passoCard}>
        <h2>{passo.titulo}</h2>
        <p className={styles.passoDescricao}>{passo.descricao}</p>

        {dicaVisivel && (
          <div className={styles.dicaBox}>
            <span className={styles.dicaIcone}>
              <Icon nome="dica" tamanho={17} />
            </span>
            <div>
              <strong>Dica</strong>
              <p>{passo.dica}</p>
            </div>
          </div>
        )}

        <div className={styles.acaoGroup}>
          <label htmlFor="acao">O que você faria agora?</label>
          <textarea
            id="acao"
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
            rows={3}
            placeholder="Descreva sua abordagem para este passo..."
            className={styles.acaoInput}
          />
        </div>

        <div className={styles.passoAcoes}>
          <button
            onClick={pedirDica}
            className="btn btn-secondary"
            disabled={dicasRestantes === 0 || dicaVisivel}
          >
            <Icon nome="dica" />
            {dicasRestantes === 0 ? 'Sem dicas restantes' : dicaVisivel ? 'Dica revelada' : 'Pedir dica'}
          </button>

          <button
            onClick={confirmar}
            className="btn btn-primary"
            disabled={acao.trim().length < 3}
          >
            {numeroAtual === totalPassos ? 'Finalizar' : 'Próximo passo'}
            <Icon nome="setaDireita" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * ResultadoFinal - filho: resumo da sessão e confirmação do resultado
 */
function ResultadoFinal({ materia, acoesUsuario, dicasUsadas, limiteSegundos, totalPassos, onSalvar, onReiniciar }) {
  const tempoTotal = somarTempos(acoesUsuario)

  return (
    <div className={styles.resultadoContainer}>
      <div className={styles.parabens}>
        <span className={styles.parabensIcone}>
          <Icon nome="medalha" tamanho={24} />
        </span>
        <h2>Você concluiu todos os passos</h2>
        <p>Agora chegou a hora de conferir sua resposta.</p>
      </div>

      <div className={styles.resumoCard}>
        <h3>Resumo da sua sessão</h3>
        <ul className={styles.resumoLista}>
          <li>
            <span><Icon nome="livro" tamanho={16} /> Matéria</span>
            <strong>{materia}</strong>
          </li>
          <li>
            <span><Icon nome="check" tamanho={16} /> Passos concluídos</span>
            <strong>{totalPassos}</strong>
          </li>
          <li>
            <span><Icon nome="dica" tamanho={16} /> Dicas usadas</span>
            <strong>{dicasUsadas} de 3</strong>
          </li>
          <li>
            <span><Icon nome="relogio" tamanho={16} /> Tempo total</span>
            <strong>{formatarDuracao(tempoTotal)}</strong>
          </li>
          <li>
            <span><Icon nome="alvo" tamanho={16} /> Tempo por passo</span>
            <strong>
              {limiteSegundos === null ? 'Sem limite' : formatarDuracao(limiteSegundos)}
            </strong>
          </li>
        </ul>
      </div>

      <div className={styles.acoesRegistradas}>
        <h4>Suas ações passo a passo</h4>
        <ol>
          {acoesUsuario.map((a, i) => (
            <li key={i}>
              <span className={styles.acaoNumero}>{String(a.passo).padStart(2, '0')}</span>
              <p>{a.acao}</p>
              <span className={styles.acaoTempo}>{formatarDuracao(a.segundos || 0)}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.conferenciaBox}>
        <h3>Sua resposta bateu com o gabarito?</h3>
        <p>
          Em produção, o LensLab compararia sua resposta com a correta automaticamente.
          Por enquanto, você confirma o resultado.
        </p>
        <div className={styles.conferenciaAcoes}>
          <button onClick={() => onSalvar(true)} className="btn btn-primary">
            <Icon nome="checkCircle" />
            Sim, acertei
          </button>
          <button onClick={() => onSalvar(false)} className="btn btn-secondary">
            <Icon nome="xCircle" />
            Não, preciso revisar
          </button>
        </div>
      </div>

      <div className={styles.acoesFinais}>
        <button onClick={onReiniciar} className="btn btn-ghost">
          <Icon nome="girar" />
          Resolver outro exercício
        </button>
      </div>
    </div>
  )
}

export default ResolveAqui
