import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from './useLocalStorage.js'
import { obter } from '../services/photos.js'
import { api } from '../services/api.js'
import { gerarId } from '../utils/math-utils.js'

export const MAX_DICAS = 3

export function somarTempos(acoes) {
  return acoes.reduce((total, item) => total + (item.segundos || 0), 0)
}

/**
 * useResolveAqui - Toda a lógica do modo Resolve Aqui.
 *
 * Os passos guiados vêm da API (/api/resolver). A API nunca devolve a
 * resposta final: só os passos e as dicas.
 *
 * Etapas: captura -> processando -> resolvendo -> resultado
 *
 * @param {string|null} fotoId - foto vinda da tela de câmera, se houver
 */
export function useResolveAqui(fotoId = null) {
  const navigate = useNavigate()
  const [exercicios, setExercicios] = useLocalStorage('lenslab_exercicios', [])
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
  const [erro, setErro] = useState('')

  const controlador = useRef(null)
  useEffect(() => () => controlador.current?.abort(), [])

  const podeEnviar = Boolean(materia) && enunciado.trim().length >= 10

  async function iniciarResolucao() {
    if (!podeEnviar) return

    setErro('')
    setEtapa('processando')
    controlador.current = new AbortController()
    const inicio = Date.now()

    try {
      const resposta = await api.resolver(materia, enunciado, controlador.current.signal)
      setPassos(resposta.passos)
      setPassoAtual(0)
      setAcoesUsuario([])
      setDicasUsadas(0)
      // Mesmo indicador que o Estuda Comigo grava; alimenta o Tempo médio da Home
      setTempoProcessamento(Date.now() - inicio)
      setEtapa('resolvendo')
    } catch (e) {
      if (controlador.current?.signal.aborted) return
      setErro(e.message)
      setEtapa('captura')
    }
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
    if (dicasUsadas < MAX_DICAS) setDicasUsadas(dicasUsadas + 1)
  }

  function salvarResultado(acertou) {
    setExercicios([{
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
    }, ...exercicios])
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
    setErro('')
  }

  return {
    foto, etapa,
    materia, setMateria, enunciado, setEnunciado,
    passos, passoAtual, acoesUsuario, dicasUsadas,
    limiteSegundos, setLimiteSegundos, tempoProcessamento,
    erro, podeEnviar,
    iniciarResolucao, registrarAcao, usarDica, salvarResultado, reiniciar
  }
}
