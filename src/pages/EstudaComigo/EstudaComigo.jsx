import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useEstudaComigo } from '../../hooks/useEstudaComigo.js'
import { useMaterias } from '../../hooks/useMaterias.js'
import { calcularPercentual, arredondar } from '../../utils/math-utils.js'
import Icon from '../../components/Icon/Icon.jsx'
import { MODOS } from '../../utils/modos-camera.js'
import { CONTAINER, BTN_PRIMARIO, BTN_SECUNDARIO, BTN_FANTASMA } from '../../styles/classes.js'

/** Card branco-sobre-escuro usado pelas telas de formulário e de recurso. */
const CARD = 'rounded-lg border border-line bg-surface p-[1.35rem] sm:p-8'
const CARD_RECURSO = 'rounded-lg border border-line bg-surface p-[1.35rem] sm:p-7'

/** Rótulo em mono maiúsculo que abre cada grupo do formulário. */
const ROTULO =
  'mb-3 block font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-3'

/** Linha de botões que vira coluna no celular. */
const ACOES = 'flex flex-col flex-wrap justify-center gap-3 pt-2 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto'

/**
 * EstudaComigo - Modo principal da Sprint 3
 *
 * Fluxo em 5 estados:
 *   1. captura     -> matéria + conteúdo
 *   2. processando -> animação de geração
 *   3. material    -> resumo + flashcards + quiz gerados
 *   4. quiz        -> quiz interativo
 *   5. resultado   -> desempenho no quiz antes de salvar
 *
 * Estrutura pai -> filho:
 *   EstudaComigo (pai)
 *     |-- FormularioCaptura (filho)
 *     |-- TelaProcessando (filho)
 *     |-- MaterialGerado (filho)
 *     |-- QuizPlayer (filho)
 *     |-- ResultadoQuiz (filho)
 */
function EstudaComigo() {
  const location = useLocation()
  const { materias } = useMaterias('estuda')

  // Toda a lógica (estado, chamada à API, salvamento) vive no hook.
  // Este componente só decide o que desenhar em cada etapa.
  const {
    foto, etapa, setEtapa,
    materia, setMateria, conteudo, setConteudo,
    material, tempoProcessamento, resultadoQuiz,
    erro, iniciarCaptura, salvarMaterial, concluirQuiz, refazerQuiz, reiniciar
  } = useEstudaComigo(location.state?.fotoId || null)

  return (
    <div className="min-h-[calc(100vh_-_var(--header-h))] bg-bg">
      <section className="relative overflow-hidden border-b border-line pb-12 pt-14">
        <div className="fundo-sobre pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className={CONTAINER}>
          <div className="relative z-[1]">
            <span className="mb-[1.15rem] inline-block rounded-full border border-accent/20 bg-accent/6 px-[0.7rem] py-[0.3rem] font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-accent">
              Modo Estuda Comigo
            </span>
            <h1 className="mb-[0.85rem] max-w-[20ch] text-[clamp(1.85rem,4vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.04em]">
              Transforme sua foto em <span className="text-accent">material de estudo</span>
            </h1>
            <p className="max-w-[62ch] text-base leading-relaxed text-ink-2">
              Fotografe um slide, uma página de livro ou a lousa. O LensLab gera resumo, flashcards e quiz automaticamente.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-18 pt-12">
        <div className={CONTAINER}>
          {etapa === 'captura' && (
            <FormularioCaptura
              foto={foto}
              materias={materias}
              erro={erro}
              materia={materia}
              setMateria={setMateria}
              conteudo={conteudo}
              setConteudo={setConteudo}
              onEnviar={iniciarCaptura}
            />
          )}

          {etapa === 'processando' && <TelaProcessando />}

          {etapa === 'material' && material && (
            <MaterialGerado
              material={material}
              tempoProcessamento={tempoProcessamento}
              onFazerQuiz={() => setEtapa('quiz')}
              onSalvar={() => salvarMaterial()}
              onReiniciar={reiniciar}
            />
          )}

          {etapa === 'quiz' && material && (
            <QuizPlayer
              quiz={material.recursos.quiz}
              onConcluir={concluirQuiz}
              onVoltar={() => setEtapa('material')}
            />
          )}

          {etapa === 'resultado' && resultadoQuiz && (
            <ResultadoQuiz
              resultado={resultadoQuiz}
              materia={material.materia}
              onSalvar={() => salvarMaterial(resultadoQuiz)}
              onRefazer={refazerQuiz}
            />
          )}
        </div>
      </section>
    </div>
  )
}

/**
 * FormularioCaptura - filho: entrada do material capturado
 */
function FormularioCaptura({ foto, materias, erro, materia, setMateria, conteudo, setConteudo, onEnviar }) {
  return (
    <div className={`mx-auto max-w-[680px] ${CARD}`}>
      {foto ? (
        <div className="mb-8">
          <img
            src={foto.dataURL}
            alt="Material capturado"
            className="mb-[1.35rem] max-h-[260px] w-full rounded-md border border-line object-cover"
          />
          <ModoDaCaptura slug={foto.modoCaptura} />
          <h2 className="mb-2 text-[1.35rem] tracking-[-0.03em] text-ink">Confirme o conteúdo</h2>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            Esta é a foto que você capturou. Em produção o OCR leria o texto dela
            automaticamente; aqui você escolhe a matéria e digita o conteúdo.
          </p>
        </div>
      ) : (
        <div className="mb-8">
          <span className="mb-[1.1rem] grid h-[42px] w-[42px] place-items-center rounded-sm bg-accent/12 text-accent">
            <Icon nome="livro" tamanho={22} />
          </span>
          <h2 className="mb-2 text-[1.35rem] tracking-[-0.03em] text-ink">Simule a captura</h2>
          <p className="text-[0.9375rem] leading-relaxed text-ink-2">
            Escolha a matéria e digite o que estaria na foto, ou{' '}
            <Link
              to="/camera"
              className="border-b border-accent/40 font-medium text-accent hover:border-accent"
            >
              abra a câmera
            </Link>{' '}
            para fotografar o material de verdade.
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
              className={`rounded-sm border px-3 py-[0.7rem] text-sm font-medium transition ${
                materia === m
                  ? 'border-accent/40 bg-accent/12 text-accent'
                  : 'border-line bg-white/[0.02] text-ink-2 hover:border-line-2 hover:bg-white/5 hover:text-ink'
              }`}
              onClick={() => setMateria(m)}
              aria-pressed={materia === m}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="conteudo" className={ROTULO}>Conteúdo do material</label>
        <textarea
          id="conteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={5}
          placeholder="Ex: A derivada de uma função representa a taxa de variação instantânea..."
          className="w-full resize-y rounded-sm border border-line bg-white/[0.02] px-4 py-[0.9rem] text-[0.9375rem] leading-relaxed text-ink transition placeholder:text-ink-3 focus:border-accent/40 focus:shadow-[0_0_0_3px_var(--accent-06)] focus:outline-none"
        />
        <small className="mt-[0.55rem] block font-mono text-xs text-ink-3">
          {conteudo.length} caracteres (mínimo 10)
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
        disabled={!materia || conteudo.length < 10}
      >
        <Icon nome="brilho" />
        Gerar material de estudo
      </button>
    </div>
  )
}

/**
 * ModoDaCaptura - filho: mostra em que modo da câmera a foto foi tirada.
 *
 * É o que liga a câmera ao modo de estudo: fotografar a lousa no modo
 * Lousa e mandar para o Estuda Comigo deixa de ser coincidência e passa a
 * ser parte do registro do material.
 *
 * A cor vem do próprio modo (utils/modos-camera.js), então continua vindo
 * por variável CSS: é um dado, não uma escolha de estilo desta tela.
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
 * TelaProcessando - filho: animação de processamento
 */
function TelaProcessando() {
  return (
    <div className={`mx-auto max-w-[680px] text-center ${CARD} sm:px-8 sm:py-14`}>
      <span className="animate-boiar mx-auto mb-[1.35rem] grid h-14 w-14 place-items-center rounded-md bg-accent/12 text-accent">
        <Icon nome="processador" tamanho={26} />
      </span>
      <h2 className="mb-2 text-[1.35rem] tracking-[-0.03em] text-ink">Processando seu material...</h2>
      <p className="text-[0.9375rem] leading-relaxed text-ink-2">
        A IA está lendo o conteúdo e gerando resumo, flashcards e quiz.
      </p>
      <div className="mx-auto mt-7 h-1 w-full max-w-[320px] overflow-hidden rounded-full bg-surface-3">
        <div className="animate-progresso h-full rounded-full bg-gradient-to-r from-accent to-accent-hi" />
      </div>
    </div>
  )
}

/**
 * CabecalhoRecurso - filho reutilizado pelos cards de resumo, flashcards e quiz.
 */
function CabecalhoRecurso({ icone, titulo }) {
  return (
    <div className="mb-[1.35rem] flex items-center gap-3 border-b border-line pb-[1.1rem]">
      <span className="grid h-8 w-8 place-items-center rounded-xs bg-accent/12 text-accent">
        <Icon nome={icone} tamanho={18} />
      </span>
      <h3 className="text-[1.0625rem] tracking-[-0.02em] text-ink">{titulo}</h3>
    </div>
  )
}

/**
 * MaterialGerado - filho: resumo + flashcards + entrada do quiz
 */
function MaterialGerado({ material, tempoProcessamento, onFazerQuiz, onSalvar, onReiniciar }) {
  const [flashcardAtual, setFlashcardAtual] = useState(0)
  const [respostaRevelada, setRespostaRevelada] = useState(false)

  const { resumo, flashcards, quiz } = material.recursos
  const flashcard = flashcards[flashcardAtual]
  const tempoSegundos = arredondar(tempoProcessamento / 1000, 1)

  function proximoCard() {
    setRespostaRevelada(false)
    setFlashcardAtual((flashcardAtual + 1) % flashcards.length)
  }

  return (
    <div className="mx-auto flex max-w-[780px] flex-col gap-4">
      <div className="flex items-start gap-[0.9rem] rounded-md border border-accent/20 bg-accent/6 px-5 py-[1.1rem] sm:items-center">
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-xs bg-accent text-bg">
          <Icon nome="check" tamanho={18} />
        </span>
        <div>
          <strong className="block text-[0.9375rem] tracking-[-0.01em] text-ink">
            Material gerado em {tempoSegundos}s
          </strong>
          <small className="text-[0.8125rem] text-ink-2">Bem abaixo da meta de 30 segundos.</small>
        </div>
      </div>

      {/* Resumo */}
      <div className={CARD_RECURSO}>
        <CabecalhoRecurso icone="documento" titulo={resumo.titulo} />
        <ul className="flex flex-col gap-2">
          {resumo.topicos.map(t => (
            <li
              key={t.numero}
              className="flex gap-[0.9rem] rounded-sm border border-line bg-white/[0.02] px-4 py-[0.9rem]"
            >
              <span className="pt-[0.15rem] font-mono text-xs text-accent">
                {String(t.numero).padStart(2, '0')}
              </span>
              <div>
                <strong className="mb-[0.2rem] block text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink">
                  {t.titulo}
                </strong>
                <p className="text-sm leading-[1.55] text-ink-2">{t.descricao}</p>
              </div>
            </li>
          ))}
        </ul>
        {resumo.palavrasChave.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-[0.4rem] border-t border-line pt-[1.1rem]">
            <span className="mr-[0.35rem] font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
              Palavras-chave
            </span>
            {resumo.palavrasChave.map(p => (
              <span
                key={p}
                className="rounded-full bg-accent/12 px-[0.65rem] py-1 text-xs font-medium text-accent"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Flashcards */}
      <div className={CARD_RECURSO}>
        <CabecalhoRecurso icone="cartoes" titulo={`Flashcards (${flashcards.length})`} />
        <div className="rounded-md border border-line bg-white/[0.02] p-5 text-center sm:p-7">
          <span className="mb-[1.15rem] inline-block font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
            Flashcard {flashcard.numero} de {flashcards.length}
          </span>
          <div className="mb-6 flex min-h-[110px] flex-col justify-center">
            <p className="text-[1.0625rem] font-semibold leading-[1.45] tracking-[-0.02em] text-ink">
              {flashcard.pergunta}
            </p>
            {respostaRevelada && (
              <p className="animate-surgir mt-4 border-t border-line pt-4 text-[0.9375rem] text-ink-2">
                {flashcard.resposta}
              </p>
            )}
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row [&>*]:w-full sm:[&>*]:w-auto">
            {!respostaRevelada ? (
              <button className={BTN_SECUNDARIO} onClick={() => setRespostaRevelada(true)}>
                <Icon nome="olho" />
                Revelar resposta
              </button>
            ) : (
              <button className={BTN_PRIMARIO} onClick={proximoCard}>
                Próximo
                <Icon nome="setaDireita" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className={CARD_RECURSO}>
        <CabecalhoRecurso icone="ajuda" titulo={`Quiz (${quiz.length} questões)`} />
        <p className="mb-[1.35rem] text-[0.9375rem] text-ink-2">
          Um quiz de múltipla escolha está pronto para testar seu conhecimento.
        </p>
        <button className={BTN_PRIMARIO} onClick={onFazerQuiz}>
          <Icon nome="alvo" />
          Iniciar quiz agora
        </button>
      </div>

      <div className={ACOES}>
        <button onClick={onSalvar} className={BTN_SECUNDARIO}>
          <Icon nome="salvar" />
          Salvar sem fazer quiz
        </button>
        <button onClick={onReiniciar} className={BTN_FANTASMA}>
          <Icon nome="girar" />
          Nova captura
        </button>
      </div>
    </div>
  )
}

/**
 * QuizPlayer - filho: executa o quiz interativo
 */
function QuizPlayer({ quiz, onConcluir, onVoltar }) {
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [respostas, setRespostas] = useState([])
  const [respostaSelecionada, setRespostaSelecionada] = useState(null)
  const [mostrandoFeedback, setMostrandoFeedback] = useState(false)

  const questao = quiz[questaoAtual]
  const alternativaCorreta = questao.alternativas.find(a => a.correta)

  function selecionar(altId) {
    if (mostrandoFeedback) return
    setRespostaSelecionada(altId)
  }

  function confirmar() {
    if (!respostaSelecionada) return

    const acertou = respostaSelecionada === alternativaCorreta.id
    setRespostas([...respostas, { questaoId: questao.id, resposta: respostaSelecionada, acertou }])
    setMostrandoFeedback(true)
  }

  function proximaQuestao() {
    if (questaoAtual + 1 < quiz.length) {
      setQuestaoAtual(questaoAtual + 1)
      setRespostaSelecionada(null)
      setMostrandoFeedback(false)
    } else {
      const acertos = respostas.filter(r => r.acertou).length
      const percentual = calcularPercentual(acertos, quiz.length)
      onConcluir({ acertos, total: quiz.length, percentual, respostas })
    }
  }

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-[0.85rem] flex items-center justify-between">
        <button
          onClick={onVoltar}
          className="inline-flex items-center gap-[0.4rem] rounded-xs py-[0.4rem] pl-2 pr-[0.7rem] text-sm font-medium text-ink-3 transition hover:bg-white/[0.04] hover:text-ink"
        >
          <Icon nome="setaEsquerda" tamanho={16} />
          Voltar
        </button>
        <span className="font-mono text-xs tracking-[0.04em] text-ink-3">
          Questão {questaoAtual + 1} de {quiz.length}
        </span>
      </div>

      <div className="mb-6 h-[3px] overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${((questaoAtual + 1) / quiz.length) * 100}%` }}
        />
      </div>

      <div className={CARD}>
        <h2 className="mb-6 text-[1.2rem] leading-[1.45] tracking-[-0.025em] text-ink">
          {questao.pergunta}
        </h2>

        <div className="mb-6 flex flex-col gap-2">
          {questao.alternativas.map(alt => {
            const isSelecionada = respostaSelecionada === alt.id
            const isCorreta = alt.correta
            const mostrarEstado = mostrandoFeedback

            // Estado visual da alternativa: neutra, escolhida, certa ou errada
            let moldura = 'border-line bg-white/[0.02] text-ink-2 enabled:hover:border-line-2 enabled:hover:bg-white/[0.045] enabled:hover:text-ink'
            let letra = 'bg-white/5 text-ink-3'
            if (isSelecionada && !mostrarEstado) {
              moldura = 'border-accent/40 bg-accent/6 text-ink'
              letra = 'bg-accent text-bg'
            }
            if (mostrarEstado && isCorreta) {
              moldura = 'border-accent/40 bg-accent/12 text-ink'
              letra = 'bg-accent text-bg'
            }
            if (mostrarEstado && isSelecionada && !isCorreta) {
              moldura = 'border-danger/40 bg-danger/10 text-ink'
              letra = 'bg-danger text-bg'
            }

            return (
              <button
                key={alt.id}
                className={`flex w-full items-center gap-[0.85rem] rounded-sm border px-[0.85rem] py-3 text-left text-sm transition disabled:cursor-default sm:px-4 sm:py-[0.85rem] sm:text-[0.9375rem] ${moldura}`}
                onClick={() => selecionar(alt.id)}
                disabled={mostrandoFeedback}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-xs font-mono text-xs font-medium transition ${letra}`}
                >
                  {alt.id}
                </span>
                <span className="flex-1">{alt.texto}</span>
                {mostrarEstado && isCorreta && (
                  <span className="ml-auto grid place-items-center text-accent">
                    <Icon nome="check" tamanho={17} traco={2.2} />
                  </span>
                )}
                {mostrarEstado && isSelecionada && !isCorreta && (
                  <span className="ml-auto grid place-items-center text-danger">
                    <Icon nome="x" tamanho={17} traco={2.2} />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex justify-center">
          {!mostrandoFeedback ? (
            <button
              className={`${BTN_PRIMARIO} w-full`}
              onClick={confirmar}
              disabled={!respostaSelecionada}
            >
              Confirmar resposta
            </button>
          ) : (
            <button className={`${BTN_PRIMARIO} w-full`} onClick={proximaQuestao}>
              {questaoAtual + 1 < quiz.length ? 'Próxima' : 'Ver resultado'}
              <Icon nome="setaDireita" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ResultadoQuiz - filho: desempenho no quiz antes de salvar na galeria
 *
 * Existe para fechar o ciclo pedagógico: o aluno responde, vê como foi e
 * só então decide salvar. Antes o quiz terminava e o app navegava direto
 * para a Galeria, sem devolver o desempenho.
 */
function ResultadoQuiz({ resultado, materia, onSalvar, onRefazer }) {
  const { acertos, total, percentual, respostas } = resultado
  const bomDesempenho = percentual >= 70

  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-4">
      <div
        className={`rounded-lg border p-[1.35rem] text-center sm:px-8 sm:py-9 ${
          bomDesempenho
            ? 'fundo-placar-bom border-accent/20'
            : 'fundo-placar-revisar border-warning/25'
        }`}
      >
        <span
          className={`mx-auto mb-[1.15rem] grid h-12 w-12 place-items-center rounded-md ${
            bomDesempenho ? 'bg-accent/12 text-accent' : 'bg-warning/14 text-warning'
          }`}
        >
          <Icon nome={bomDesempenho ? 'medalha' : 'grafico'} tamanho={22} />
        </span>
        <strong
          className={`block text-[2.75rem] font-bold leading-none tracking-[-0.04em] tabular-nums ${
            bomDesempenho ? 'text-accent' : 'text-warning'
          }`}
        >
          {percentual}%
        </strong>
        <span className="mt-[0.6rem] block font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-ink-3">
          {acertos} de {total} {total === 1 ? 'questão correta' : 'questões corretas'}
        </span>
        <p className="mx-auto mt-4 max-w-[44ch] text-[0.9375rem] leading-relaxed text-ink-2">
          {bomDesempenho
            ? `Bom domínio do conteúdo de ${materia}. Salve o material para revisar antes da prova.`
            : `Vale revisar o resumo e os flashcards de ${materia} antes de tentar de novo.`}
        </p>
      </div>

      <div className={CARD_RECURSO}>
        <CabecalhoRecurso icone="ajuda" titulo="Questão a questão" />
        <ul className="flex flex-col gap-2">
          {respostas.map((resposta, i) => (
            <li
              key={resposta.questaoId}
              className={`flex items-center gap-[0.85rem] rounded-sm border bg-white/[0.02] px-4 py-3 text-[0.9rem] text-ink-2 ${
                resposta.acertou
                  ? 'border-accent/20 [&>svg]:text-accent'
                  : 'border-danger/25 [&>svg]:text-danger'
              }`}
            >
              <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              <span className="flex-1">Você marcou a alternativa {resposta.resposta}</span>
              <Icon nome={resposta.acertou ? 'check' : 'x'} tamanho={16} traco={2.2} />
            </li>
          ))}
        </ul>
      </div>

      <div className={ACOES}>
        <button onClick={onSalvar} className={BTN_PRIMARIO}>
          <Icon nome="salvar" />
          Salvar na galeria
        </button>
        <button onClick={onRefazer} className={BTN_SECUNDARIO}>
          <Icon nome="girar" />
          Refazer o quiz
        </button>
      </div>
    </div>
  )
}

export default EstudaComigo
