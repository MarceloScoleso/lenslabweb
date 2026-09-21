import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useResolveAqui, MAX_DICAS, somarTempos } from '../../hooks/useResolveAqui.js'
import { useMaterias } from '../../hooks/useMaterias.js'
import { formatarDuracao, arredondar } from '../../utils/math-utils.js'
import Icon from '../../components/Icon/Icon.jsx'
import { MODOS } from '../../utils/modos-camera.js'
import { CONTAINER, BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FANTASMA } from '../../styles/classes.js'

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

const CARD = 'rounded-lg border border-line bg-surface p-[1.35rem] sm:p-8'
const CARD_RESUMO = 'rounded-lg border border-line bg-surface p-[1.35rem] sm:p-7'

const ROTULO =
  'mb-3 block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-3'

const CAMPO =
  'w-full resize-y rounded-sm border border-line bg-white/[0.02] px-4 py-[0.9rem] text-[0.9375rem] leading-relaxed text-ink transition placeholder:text-ink-3 focus:border-accent/40 focus:shadow-[0_0_0_3px_var(--accent-06)] focus:outline-none'

const AJUDA = 'mt-[0.55rem] block font-mono text-xs text-ink-3'

/** Botão de escolha (matéria, tempo): muda só a pele quando ativo. */
function classeEscolha(ativo, extra = '') {
  return `rounded-sm border px-3 py-[0.7rem] transition ${extra} ${
    ativo
      ? 'border-accent/40 bg-accent/12 text-accent'
      : 'border-line bg-white/[0.02] text-ink-2 hover:border-line-2 hover:bg-white/5 hover:text-ink'
  }`
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
  const location = useLocation()
  const { materias } = useMaterias('resolve')

  // Toda a lógica (estado, chamada à API, dicas, salvamento) vive no hook.
  const {
    foto, etapa,
    materia, setMateria, enunciado, setEnunciado,
    passos, passoAtual, acoesUsuario, dicasUsadas,
    limiteSegundos, setLimiteSegundos, tempoProcessamento,
    erro, iniciarResolucao, registrarAcao, usarDica, salvarResultado, reiniciar
  } = useResolveAqui(location.state?.fotoId || null)

  return (
    <div className="min-h-[calc(100vh_-_var(--header-h))] bg-bg">
      <section className="relative overflow-hidden border-b border-line pb-12 pt-14">
        <div className="fundo-sobre pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className={CONTAINER}>
          <div className="relative z-[1]">
            <span className="mb-[1.15rem] inline-block rounded-full border border-accent/20 bg-accent/6 px-[0.7rem] py-[0.3rem] font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-accent">
              Modo Resolve Aqui
            </span>
            <h1 className="mb-[0.85rem] max-w-[24ch] text-[clamp(1.85rem,4vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.04em]">
              Resolva com <span className="text-accent">orientação</span>, não com a resposta pronta
            </h1>
            <p className="max-w-[62ch] text-base leading-relaxed text-ink-2">
              Fotografe seu exercício. O LensLab te guia passo a passo, respeitando seu raciocínio.
            </p>
            <p className="mt-[1.1rem] max-w-[62ch] border-l-2 border-accent/40 pl-[0.9rem] text-[0.9375rem] italic leading-relaxed text-ink-3">
              "Photomath responde, ChatGPT explica, LensLab ensina."
            </p>
          </div>
        </div>
      </section>

      <section className="pb-18 pt-12">
        <div className={CONTAINER}>
          {etapa === 'captura' && (
            <FormularioExercicio
              foto={foto}
              materias={materias}
              erro={erro}
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
function FormularioExercicio({ foto, materias, erro, materia, setMateria, enunciado, setEnunciado, limiteSegundos, setLimiteSegundos, onEnviar }) {
  return (
    <div className={`mx-auto max-w-[680px] ${CARD}`}>
      {foto ? (
        <div className="mb-8">
          <img
            src={foto.dataURL}
            alt="Exercício capturado"
            className="mb-[1.35rem] max-h-[260px] w-full rounded-md border border-line object-cover"
          />
          <ModoDaCaptura slug={foto.modoCaptura} />
          <h2 className="mb-2 text-[1.35rem] tracking-[-0.03em] text-ink">Confirme o enunciado</h2>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            Este é o exercício que você fotografou. Escolha a matéria e digite
            o enunciado que aparece na imagem.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <span className="mb-[1.1rem] grid h-[42px] w-[42px] place-items-center rounded-sm bg-accent/12 text-accent">
            <Icon nome="calculadora" tamanho={22} />
          </span>
          <h2 className="mb-2 text-[1.35rem] tracking-[-0.03em] text-ink">Envie seu exercício</h2>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            Escolha a matéria e digite o enunciado, ou{' '}
            <Link
              to="/camera"
              className="border-b border-accent/40 font-medium text-accent hover:border-accent"
            >
              abra a câmera
            </Link>{' '}
            para fotografar o exercício.
          </p>
        </div>
      )}

      <div className="mb-6">
        <span className={ROTULO}>Matéria</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {materias.map(m => (
            <button
              key={m}
              type="button"
              className={classeEscolha(materia === m, 'text-sm font-medium')}
              onClick={() => setMateria(m)}
              aria-pressed={materia === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="enunciado" className={ROTULO}>Enunciado do exercício</label>
        <textarea
          id="enunciado"
          value={enunciado}
          onChange={(e) => setEnunciado(e.target.value)}
          rows={5}
          placeholder="Ex: Calcule a velocidade final de um corpo em queda livre após 3 segundos, considerando g = 10 m/s²..."
          className={CAMPO}
        />
        <small className={AJUDA}>
          {enunciado.length} caracteres (mínimo 10)
        </small>
      </div>

      <div className="mb-6">
        <span className={ROTULO}>Tempo por passo</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {OPCOES_TEMPO.map(opcao => (
            <button
              key={opcao.rotulo}
              type="button"
              className={classeEscolha(
                limiteSegundos === opcao.segundos,
                'font-mono text-[0.8125rem]'
              )}
              onClick={() => setLimiteSegundos(opcao.segundos)}
              aria-pressed={limiteSegundos === opcao.segundos}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
        <small className={AJUDA}>
          O cronômetro mede o seu ritmo em cada passo e nunca interrompe a
          resolução: se o tempo acabar, você continua de onde parou.
        </small>
      </div>

      {erro && (
        <p role="alert" className="mb-4 w-full rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-left text-sm text-danger">
          {erro}
        </p>
      )}

      <button
        onClick={onEnviar}
        className={`${BTN_PRIMARIO} w-full`}
        disabled={!materia || enunciado.length < 10}
      >
        <Icon nome="alvo" />
        Começar resolução guiada
      </button>
    </div>
  )
}

/**
 * ModoDaCaptura - filho: mostra em que modo da câmera a foto foi tirada.
 * A cor vem do próprio modo (utils/modos-camera.js), por isso vai inline.
 */
function ModoDaCaptura({ slug }) {
  const modo = slug && MODOS[slug]
  if (!modo || slug === 'foto') return null

  return (
    <span
      className="mb-[0.9rem] inline-flex items-center gap-[0.4rem] rounded-full border px-[0.7rem] py-[0.3rem] font-mono text-[0.6875rem] tracking-[0.06em]"
      style={{
        color: modo.cor,
        backgroundColor: `color-mix(in srgb, ${modo.cor} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${modo.cor} 35%, transparent)`
      }}
    >
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
    <div className={`mx-auto max-w-[680px] text-center ${CARD} sm:px-8 sm:py-14`}>
      <span className="animate-boiar mx-auto mb-[1.35rem] grid h-14 w-14 place-items-center rounded-md bg-accent/12 text-accent">
        <Icon nome="processador" tamanho={26} />
      </span>
      <h2 className="mb-2 text-[1.35rem] tracking-[-0.03em] text-ink">Analisando o exercício...</h2>
      <p className="text-[0.9375rem] leading-relaxed text-ink-2">
        Identificando os passos ideais para você resolver.
      </p>
      <div className="mx-auto mt-7 h-1 w-full max-w-[320px] overflow-hidden rounded-full bg-surface-3">
        <div className="animate-progresso h-full rounded-full bg-gradient-to-r from-accent to-accent-hi" />
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

  // Pele do cronômetro conforme o tempo aperta
  let peleTempo = 'border-line bg-surface text-ink-3'
  let peleValor = 'text-ink'
  if (atencao) {
    peleTempo = 'border-warning/35 bg-warning/8 text-warning'
    peleValor = 'text-warning'
  }
  if (estourou) {
    peleTempo = 'border-danger/35 bg-danger/8 text-danger'
    peleValor = 'text-danger'
  }

  return (
    <div className="mx-auto max-w-[760px]">
      {/* A promessa dos 30 segundos vale para os dois modos: aqui ela
          aparece no instante em que a resolução fica pronta. */}
      {numeroAtual === 1 && tempoProcessamento > 0 && (
        <p className="mb-[0.85rem] flex flex-wrap items-center gap-2 rounded-sm border border-accent/20 bg-accent/6 px-[0.9rem] py-[0.6rem] text-[0.8125rem] text-ink-2 [&>svg]:text-accent">
          <Icon nome="raio" tamanho={15} />
          Resolução preparada em{' '}
          <strong className="font-mono font-medium text-accent">
            {arredondar(tempoProcessamento / 1000, 1)}s
          </strong>
          <span className="text-xs text-ink-3">bem abaixo da meta de 30 segundos</span>
        </p>
      )}

      <div className="mb-[0.85rem] flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
        <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-accent">
          Passo {numeroAtual} de {totalPassos}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={`inline-flex items-center gap-[0.45rem] rounded-full border px-[0.8rem] py-[0.35rem] text-[0.8125rem] transition ${peleTempo}`}
            role="timer"
            aria-label={rotuloTempo}
            title={rotuloTempo}
          >
            <Icon nome="relogio" tamanho={15} />
            <strong className={`font-mono text-[0.8125rem] font-medium tabular-nums ${peleValor}`}>
              {textoTempo}
            </strong>
            {estourou && (
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em]">esgotado</span>
            )}
          </div>
          <div className="inline-flex items-center gap-[0.45rem] rounded-full border border-line bg-surface px-[0.8rem] py-[0.35rem] text-[0.8125rem] text-ink-3 [&>svg]:text-warning">
            <Icon nome="dica" tamanho={15} />
            Dicas restantes{' '}
            <strong className="font-mono text-[0.8125rem] text-ink">{dicasRestantes}</strong>
          </div>
        </div>
      </div>

      <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hi transition-[width] duration-[400ms]"
          style={{ width: `${(numeroAtual / totalPassos) * 100}%` }}
        />
      </div>

      <div className={CARD}>
        <h2 className="mb-3 text-[1.3rem] tracking-[-0.03em] text-ink">{passo.titulo}</h2>
        <p className="mb-6 text-[0.9875rem] leading-[1.65] text-ink-2">{passo.descricao}</p>

        {dicaVisivel && (
          <div className="animate-surgir mb-6 flex items-start gap-[0.9rem] rounded-md border border-warning/25 bg-warning/7 px-[1.2rem] py-[1.1rem]">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xs bg-warning/14 text-warning">
              <Icon nome="dica" tamanho={17} />
            </span>
            <div>
              <strong className="mb-[0.3rem] block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-warning">
                Dica
              </strong>
              <p className="text-[0.9375rem] leading-relaxed text-ink-2">{passo.dica}</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="acao" className={ROTULO}>O que você faria agora?</label>
          <textarea
            id="acao"
            value={acao}
            onChange={(e) => setAcao(e.target.value)}
            rows={3}
            placeholder="Descreva sua abordagem para este passo..."
            className={CAMPO}
          />
        </div>

        <div className="flex flex-col-reverse flex-wrap justify-between gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
          <button
            onClick={pedirDica}
            className={BTN_SECUNDARIO}
            disabled={dicasRestantes === 0 || dicaVisivel}
          >
            <Icon nome="dica" />
            {dicasRestantes === 0 ? 'Sem dicas restantes' : dicaVisivel ? 'Dica revelada' : 'Pedir dica'}
          </button>

          <button
            onClick={confirmar}
            className={BTN_PRIMARIO}
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

  const resumo = [
    { id: 'materia', icone: 'livro', rotulo: 'Matéria', valor: materia },
    { id: 'passos', icone: 'check', rotulo: 'Passos concluídos', valor: totalPassos },
    { id: 'dicas', icone: 'dica', rotulo: 'Dicas usadas', valor: `${dicasUsadas} de 3` },
    { id: 'tempo', icone: 'relogio', rotulo: 'Tempo total', valor: formatarDuracao(tempoTotal) },
    {
      id: 'limite',
      icone: 'alvo',
      rotulo: 'Tempo por passo',
      valor: limiteSegundos === null ? 'Sem limite' : formatarDuracao(limiteSegundos)
    }
  ]

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-4">
      <div className="fundo-placar-bom rounded-lg border border-accent/20 p-[1.35rem] text-center sm:px-8 sm:py-9">
        <span className="mx-auto mb-[1.1rem] grid h-[52px] w-[52px] place-items-center rounded-md bg-accent/12 text-accent">
          <Icon nome="medalha" tamanho={24} />
        </span>
        <h2 className="mb-[0.4rem] text-[1.35rem] tracking-[-0.03em] text-ink">
          Você concluiu todos os passos
        </h2>
        <p className="text-[0.9375rem] text-ink-2">Agora chegou a hora de conferir sua resposta.</p>
      </div>

      <div className={CARD_RESUMO}>
        <h3 className="mb-[1.1rem] text-base tracking-[-0.02em] text-ink">Resumo da sua sessão</h3>
        <ul className="flex flex-col gap-2">
          {resumo.map(linha => (
            <li
              key={linha.id}
              className="flex items-center justify-between gap-4 rounded-sm border border-line bg-white/[0.02] px-4 py-3"
            >
              <span className="inline-flex items-center gap-[0.55rem] text-[0.9rem] text-ink-2 [&>svg]:text-ink-3">
                <Icon nome={linha.icone} tamanho={16} /> {linha.rotulo}
              </span>
              <strong className="text-[0.9rem] font-semibold text-ink">{linha.valor}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className={CARD_RESUMO}>
        <h4 className="mb-[1.1rem] text-base tracking-[-0.02em] text-ink">Suas ações passo a passo</h4>
        <ol className="flex flex-col gap-[0.15rem]">
          {acoesUsuario.map((a, i) => (
            <li
              key={i}
              className="flex gap-[0.85rem] border-b border-line py-[0.65rem] last:border-b-0 last:pb-0"
            >
              <span className="shrink-0 pt-[0.15rem] font-mono text-xs text-accent">
                {String(a.passo).padStart(2, '0')}
              </span>
              <p className="flex-1 text-[0.9375rem] leading-[1.55] text-ink-2">{a.acao}</p>
              <span className="shrink-0 pt-[0.15rem] font-mono text-xs text-ink-3">
                {formatarDuracao(a.segundos || 0)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-accent/20 bg-surface p-[1.35rem] text-center sm:p-7">
        <h3 className="mb-2 text-[1.1rem] tracking-[-0.025em] text-ink">
          Sua resposta bateu com o gabarito?
        </h3>
        <p className="mb-6 text-[0.9rem] leading-relaxed text-ink-2">
          Em produção, o LensLab compararia sua resposta com a correta automaticamente.
          Por enquanto, você confirma o resultado.
        </p>
        <div className="flex flex-col-reverse flex-wrap justify-center gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
          <button onClick={() => onSalvar(true)} className={BTN_PRIMARIO}>
            <Icon nome="checkCircle" />
            Sim, acertei
          </button>
          <button onClick={() => onSalvar(false)} className={BTN_SECUNDARIO}>
            <Icon nome="xCircle" />
            Não, preciso revisar
          </button>
        </div>
      </div>

      <div className="pt-1 text-center">
        <button onClick={onReiniciar} className={BTN_FANTASMA}>
          <Icon nome="girar" />
          Resolver outro exercício
        </button>
      </div>
    </div>
  )
}

export default ResolveAqui
