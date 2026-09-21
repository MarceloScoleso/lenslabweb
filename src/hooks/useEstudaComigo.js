import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './useLocalStorage.js'
import { obter } from '../services/photos.js'
import { api } from '../services/api.js'
import { gerarId } from '../utils/math-utils.js'

/**
 * useEstudaComigo - Toda a lógica do modo Estuda Comigo.
 *
 * A página só desenha o que este hook devolve. O material agora é gerado
 * pela API (/api/estudar) em vez de no próprio navegador.
 *
 * Etapas: captura -> processando -> material -> quiz -> resultado
 *
 * @param {string|null} fotoId - foto vinda da tela de câmera, se houver
 */
export function useEstudaComigo(fotoId = null) {
  const navigate = useNavigate()
  const [notas, setNotas] = useLocalStorage('lenslab_notas', [])
  const foto = useMemo(() => (fotoId ? obter(fotoId) : null), [fotoId])

  const [etapa, setEtapa] = useState('captura')
  const [materia, setMateria] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [material, setMaterial] = useState(null)
  const [tempoProcessamento, setTempoProcessamento] = useState(0)
  const [resultadoQuiz, setResultadoQuiz] = useState(null)
  const [erro, setErro] = useState('')

  // Cancela a requisição se o usuário sair da página no meio da geração
  const controlador = useRef(null)
  useEffect(() => () => controlador.current?.abort(), [])

  const podeEnviar = Boolean(materia) && conteudo.trim().length >= 10

  async function iniciarCaptura() {
    if (!podeEnviar) return

    setErro('')
    setEtapa('processando')
    controlador.current = new AbortController()
    const inicio = Date.now()

    try {
      const { resumo, flashcards, quiz } = await api.estudar(materia, conteudo, controlador.current.signal)

      // Tempo visto pelo estudante: rede + processamento no servidor
      const tempoReal = Date.now() - inicio
      setTempoProcessamento(tempoReal)
      setMaterial({
        id: gerarId('nota'),
        materia,
        contexto: conteudo,
        fotoId,
        recursos: { resumo, flashcards, quiz },
        timestamp: Date.now(),
        tempoProcessamento: tempoReal
      })
      setEtapa('material')
    } catch (e) {
      if (controlador.current?.signal.aborted) return
      setErro(e.message)
      setEtapa('captura')
    }
  }

  function salvarMaterial(resultado = null) {
    setNotas([{ ...material, resultadoQuiz: resultado }, ...notas])
    navigate('/galeria')
  }

  function concluirQuiz(resultado) {
    setResultadoQuiz(resultado)
    setEtapa('resultado')
  }

  function refazerQuiz() {
    setResultadoQuiz(null)
    setEtapa('quiz')
  }

  function reiniciar() {
    setEtapa('captura')
    setMateria('')
    setConteudo('')
    setMaterial(null)
    setResultadoQuiz(null)
    setErro('')
  }

  return {
    foto, etapa, setEtapa,
    materia, setMateria, conteudo, setConteudo,
    material, tempoProcessamento, resultadoQuiz,
    erro, podeEnviar,
    iniciarCaptura, salvarMaterial, concluirQuiz, refazerQuiz, reiniciar
  }
}
