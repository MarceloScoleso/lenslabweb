import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useEstudaComigo } from '../../hooks/useEstudaComigo.js'
import { useMaterias } from '../../hooks/useMaterias.js'
import { calcularPercentual, arredondar } from '../../utils/math-utils.js'
import Icon from '../../components/Icon/Icon.jsx'
import { MODOS } from '../../utils/modos-camera.js'
import styles from './EstudaComigo.module.css'


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
    <div className={styles.page}>
      <section className={styles.header}>
        <div className={styles.headerFundo} aria-hidden="true" />
        <div className="container">
          <div className={styles.headerConteudo}>
            <span className={styles.eyebrow}>Modo Estuda Comigo</span>
            <h1>Transforme sua foto em <span className={styles.highlight}>material de estudo</span></h1>
            <p>Fotografe um slide, uma página de livro ou a lousa. O LensLab gera resumo, flashcards e quiz automaticamente.</p>
          </div>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
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
    <div className={styles.card}>
      {foto ? (
        <div className={styles.cardTopo}>
          <img src={foto.dataURL} alt="Material capturado" className={styles.fotoCapturada} />
          <ModoDaCaptura slug={foto.modoCaptura} />
          <h2>Confirme o conteúdo</h2>
          <p className={styles.cardDescricao}>
            Esta é a foto que você capturou. Em produção o OCR leria o texto dela
            automaticamente; aqui você escolhe a matéria e digita o conteúdo.
          </p>
        </div>
      ) : (
        <div className={styles.cardTopo}>
          <span className={styles.cardIcone}>
            <Icon nome="livro" tamanho={22} />
          </span>
          <h2>Simule a captura</h2>
          <p className={styles.cardDescricao}>
            Escolha a matéria e digite o que estaria na foto, ou{' '}
            <Link to="/camera" className={styles.linkCamera}>abra a câmera</Link>{' '}
            para fotografar o material de verdade.
          </p>
        </div>
      )}

      <div className={styles.formGroup}>
        <span className={styles.groupLabel}>Matéria</span>
        <div className={styles.materiaGrid}>
          {materias.map(m => (
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
        <label htmlFor="conteudo">Conteúdo do material</label>
        <textarea
          id="conteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={5}
          placeholder="Ex: A derivada de uma função representa a taxa de variação instantânea..."
          className={styles.textarea}
        />
        <small className={styles.helperText}>
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
        className={`btn btn-primary ${styles.btnBloco}`}
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
 * TelaProcessando - filho: animação de processamento
 */
function TelaProcessando() {
  return (
    <div className={`${styles.card} ${styles.processandoCard}`}>
      <span className={styles.processandoIcone}>
        <Icon nome="processador" tamanho={26} />
      </span>
      <h2>Processando seu material...</h2>
      <p className={styles.cardDescricao}>
        A IA está lendo o conteúdo e gerando resumo, flashcards e quiz.
      </p>
      <div className={styles.progressBar}>
        <div className={styles.progressFill}></div>
      </div>
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
    <div className={styles.materialContainer}>
      <div className={styles.sucessoBanner}>
        <span className={styles.sucessoIcone}>
          <Icon nome="check" tamanho={18} />
        </span>
        <div>
          <strong>Material gerado em {tempoSegundos}s</strong>
          <small>Bem abaixo da meta de 30 segundos.</small>
        </div>
      </div>

      {/* Resumo */}
      <div className={styles.recursoCard}>
        <div className={styles.recursoHeader}>
          <span className={styles.recursoIcone}>
            <Icon nome="documento" tamanho={18} />
          </span>
          <h3>{resumo.titulo}</h3>
        </div>
        <ul className={styles.topicosList}>
          {resumo.topicos.map(t => (
            <li key={t.numero}>
              <span className={styles.topicoNumero}>{String(t.numero).padStart(2, '0')}</span>
              <div>
                <strong>{t.titulo}</strong>
                <p>{t.descricao}</p>
              </div>
            </li>
          ))}
        </ul>
        {resumo.palavrasChave.length > 0 && (
          <div className={styles.palavrasChave}>
            <span>Palavras-chave</span>
            {resumo.palavrasChave.map(p => (
              <span key={p} className={styles.chip}>{p}</span>
            ))}
          </div>
        )}
      </div>

      {/* Flashcards */}
      <div className={styles.recursoCard}>
        <div className={styles.recursoHeader}>
          <span className={styles.recursoIcone}>
            <Icon nome="cartoes" tamanho={18} />
          </span>
          <h3>Flashcards ({flashcards.length})</h3>
        </div>
        <div className={styles.flashcardBox}>
          <span className={styles.flashcardNumero}>
            Flashcard {flashcard.numero} de {flashcards.length}
          </span>
          <div className={styles.flashcardConteudo}>
            <p className={styles.flashcardPergunta}>{flashcard.pergunta}</p>
            {respostaRevelada && (
              <p className={styles.flashcardResposta}>{flashcard.resposta}</p>
            )}
          </div>
          <div className={styles.flashcardAcoes}>
            {!respostaRevelada ? (
              <button
                className="btn btn-secondary"
                onClick={() => setRespostaRevelada(true)}
              >
                <Icon nome="olho" />
                Revelar resposta
              </button>
            ) : (
              <button className="btn btn-primary" onClick={proximoCard}>
                Próximo
                <Icon nome="setaDireita" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz */}
      <div className={styles.recursoCard}>
        <div className={styles.recursoHeader}>
          <span className={styles.recursoIcone}>
            <Icon nome="ajuda" tamanho={18} />
          </span>
          <h3>Quiz ({quiz.length} questões)</h3>
        </div>
        <p className={styles.quizPreview}>
          Um quiz de múltipla escolha está pronto para testar seu conhecimento.
        </p>
        <button className="btn btn-primary" onClick={onFazerQuiz}>
          <Icon nome="alvo" />
          Iniciar quiz agora
        </button>
      </div>

      <div className={styles.acoesFinais}>
        <button onClick={onSalvar} className="btn btn-secondary">
          <Icon nome="salvar" />
          Salvar sem fazer quiz
        </button>
        <button onClick={onReiniciar} className="btn btn-ghost">
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
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <button onClick={onVoltar} className={styles.voltarBtn}>
          <Icon nome="setaEsquerda" tamanho={16} />
          Voltar
        </button>
        <span className={styles.quizProgress}>
          Questão {questaoAtual + 1} de {quiz.length}
        </span>
      </div>

      <div className={styles.quizProgressBar}>
        <div
          className={styles.quizProgressFill}
          style={{ width: `${((questaoAtual + 1) / quiz.length) * 100}%` }}
        />
      </div>

      <div className={styles.questaoCard}>
        <h2>{questao.pergunta}</h2>

        <div className={styles.alternativas}>
          {questao.alternativas.map(alt => {
            const isSelecionada = respostaSelecionada === alt.id
            const isCorreta = alt.correta
            const mostrarEstado = mostrandoFeedback

            let className = styles.alternativa
            if (isSelecionada && !mostrarEstado) className += ` ${styles.altSelecionada}`
            if (mostrarEstado && isCorreta) className += ` ${styles.altCorreta}`
            if (mostrarEstado && isSelecionada && !isCorreta) className += ` ${styles.altIncorreta}`

            return (
              <button
                key={alt.id}
                className={className}
                onClick={() => selecionar(alt.id)}
                disabled={mostrandoFeedback}
              >
                <span className={styles.altLetra}>{alt.id}</span>
                <span className={styles.altTexto}>{alt.texto}</span>
                {mostrarEstado && isCorreta && (
                  <span className={styles.altIcone}><Icon nome="check" tamanho={17} traco={2.2} /></span>
                )}
                {mostrarEstado && isSelecionada && !isCorreta && (
                  <span className={styles.altIcone}><Icon nome="x" tamanho={17} traco={2.2} /></span>
                )}
              </button>
            )
          })}
        </div>

        <div className={styles.quizAcoes}>
          {!mostrandoFeedback ? (
            <button
              className={`btn btn-primary ${styles.btnBloco}`}
              onClick={confirmar}
              disabled={!respostaSelecionada}
            >
              Confirmar resposta
            </button>
          ) : (
            <button className={`btn btn-primary ${styles.btnBloco}`} onClick={proximaQuestao}>
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
    <div className={styles.resultadoContainer}>
      <div className={styles.placar} data-bom={bomDesempenho}>
        <span className={styles.placarIcone}>
          <Icon nome={bomDesempenho ? 'medalha' : 'grafico'} tamanho={22} />
        </span>
        <strong className={styles.placarValor}>{percentual}%</strong>
        <span className={styles.placarDetalhe}>
          {acertos} de {total} {total === 1 ? 'questão correta' : 'questões corretas'}
        </span>
        <p className={styles.placarMensagem}>
          {bomDesempenho
            ? `Bom domínio do conteúdo de ${materia}. Salve o material para revisar antes da prova.`
            : `Vale revisar o resumo e os flashcards de ${materia} antes de tentar de novo.`}
        </p>
      </div>

      <div className={styles.recursoCard}>
        <div className={styles.recursoHeader}>
          <span className={styles.recursoIcone}>
            <Icon nome="ajuda" tamanho={18} />
          </span>
          <h3>Questão a questão</h3>
        </div>
        <ul className={styles.respostasLista}>
          {respostas.map((resposta, i) => (
            <li
              key={resposta.questaoId}
              className={resposta.acertou ? styles.respostaCerta : styles.respostaErrada}
            >
              <span className={styles.respostaNumero}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.respostaTexto}>
                Você marcou a alternativa {resposta.resposta}
              </span>
              <Icon nome={resposta.acertou ? 'check' : 'x'} tamanho={16} traco={2.2} />
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.acoesFinais}>
        <button onClick={onSalvar} className="btn btn-primary">
          <Icon nome="salvar" />
          Salvar na galeria
        </button>
        <button onClick={onRefazer} className="btn btn-secondary">
          <Icon nome="girar" />
          Refazer o quiz
        </button>
      </div>
    </div>
  )
}

export default EstudaComigo
