import { useState, useRef, useEffect, useCallback } from 'react'
import { detectarRostos, renderizarComDesfoque } from '../utils/rostos.js'
import { salvar, lerLista, obter } from '../services/photos.js'
import { gerarId } from '../utils/math-utils.js'
import { useHistorico } from './useHistorico.js'
import { useLocalStorage } from './useLocalStorage.js'

const TAMANHO_MANUAL = 0.16 // largura da região criada por toque, em fração da imagem

/**
 * usePrivacidade - Lógica do Modo Privacidade Estudante.
 *
 * Fluxo: escolher foto -> detectar rostos -> decidir, rosto a rosto,
 * quem fica nítido e quem é desfocado -> salvar ou baixar.
 *
 * Por padrão todos os rostos começam DESFOCADOS: é mais seguro o estudante
 * escolher quem revelar do que esquecer alguém exposto.
 *
 * @param {string|null} fotoIdInicial - id de uma foto já capturada. Vem da
 *   câmera, quando o estudante escolhe "Proteger rostos" logo depois da
 *   captura: a tela abre já com aquela foto, sem passar pela seleção.
 */
export function usePrivacidade(fotoIdInicial = null) {
  const { registrar } = useHistorico()
  const [, setProtegidas] = useLocalStorage('lenslab_protegidas', [])

  const [fonte, setFonte] = useState(null)            // dataURL ou caminho da imagem original
  const [regioes, setRegioes] = useState([])
  const [intensidade, setIntensidade] = useState(6)
  const [estado, setEstado] = useState('vazio')        // vazio | detectando | pronto
  const [aviso, setAviso] = useState('')
  const [motor, setMotor] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const imagemRef = useRef(null)
  const canvasRef = useRef(null)

  const fotosGaleria = useCallback(() => lerLista().slice(0, 12), [])

  // Redesenha o resultado sempre que algo muda
  useEffect(() => {
    if (estado === 'pronto' && imagemRef.current && canvasRef.current) {
      renderizarComDesfoque(canvasRef.current, imagemRef.current, regioes, intensidade)
    }
  }, [estado, regioes, intensidade])

  const carregarImagem = useCallback(src => new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível abrir a imagem.'))
    img.src = src
  }), [])

  async function escolherImagem(src) {
    setAviso('')
    setRegioes([])
    setMotor(null)
    setFonte(src)
    setEstado('detectando')

    let img
    try {
      img = await carregarImagem(src)
      imagemRef.current = img
    } catch (e) {
      setAviso(e.message)
      setEstado('vazio')
      return
    }

    try {
      const { regioes: detectadas, motor } = await detectarRostos(img)
      setMotor(motor)
      setRegioes(detectadas.map(r => ({ ...r, id: gerarId('rosto'), borrar: true, origem: 'auto' })))
      setAviso(detectadas.length === 0
        ? 'Nenhum rosto encontrado. Toque na imagem para marcar uma área manualmente.'
        : '')
    } catch {
      setAviso('A detecção automática não está disponível neste navegador. Toque na imagem para marcar os rostos manualmente.')
    }
    setEstado('pronto')
  }

  // Abre sozinha a foto que veio da câmera. O ref garante uma vez só por
  // id, já que escolherImagem é recriada a cada render.
  const fotoJaAberta = useRef(null)
  useEffect(() => {
    if (!fotoIdInicial || fotoJaAberta.current === fotoIdInicial) return
    fotoJaAberta.current = fotoIdInicial

    const foto = obter(fotoIdInicial)
    if (foto) escolherImagem(foto.dataURL)
    else setAviso('A foto capturada não foi encontrada. Escolha uma imagem abaixo.')
  }, [fotoIdInicial]) // eslint-disable-line react-hooks/exhaustive-deps

  function aoEnviarArquivo(evento) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo) return
    if (!arquivo.type.startsWith('image/')) return setAviso('Escolha um arquivo de imagem.')

    const leitor = new FileReader()
    leitor.onload = () => escolherImagem(leitor.result)
    leitor.readAsDataURL(arquivo)
  }

  function alternar(id) {
    setRegioes(atual => atual.map(r => (r.id === id ? { ...r, borrar: !r.borrar } : r)))
  }

  function remover(id) {
    setRegioes(atual => atual.filter(r => r.id !== id))
  }

  function definirTodos(borrar) {
    setRegioes(atual => atual.map(r => ({ ...r, borrar })))
  }

  /** Cria uma região manual centrada no ponto tocado (coordenadas 0 a 1) */
  function marcarManual(px, py) {
    const img = imagemRef.current
    if (!img) return
    const proporcao = img.naturalWidth / img.naturalHeight
    const w = TAMANHO_MANUAL
    const h = TAMANHO_MANUAL * proporcao * 1.25
    setRegioes(atual => [...atual, {
      id: gerarId('rosto'),
      x: Math.min(Math.max(0, px - w / 2), 1 - w),
      y: Math.min(Math.max(0, py - h / 2), 1 - h),
      w, h,
      borrar: true,
      origem: 'manual'
    }])
    setAviso('')
  }

  function exportar() {
    return canvasRef.current?.toDataURL('image/jpeg', 0.9) || null
  }

  async function salvarNaGaleria() {
    const dataURL = exportar()
    if (!dataURL) return null
    setSalvando(true)
    try {
      const foto = await salvar(dataURL, 'privacidade')
      const quantos = regioes.filter(r => r.borrar).length

      // A foto protegida também vira um item da Galeria, ao lado dos
      // materiais e dos exercícios, para poder ser filtrada e removida
      // pelos mesmos caminhos.
      setProtegidas(atual => [{
        id: gerarId('protegida'),
        fotoId: foto.id,
        materia: null,
        contexto: quantos === 1
          ? '1 rosto desfocado antes de compartilhar.'
          : `${quantos} rostos desfocados antes de compartilhar.`,
        rostosDesfocados: quantos,
        totalRostos: regioes.length,
        intensidade,
        timestamp: Date.now()
      }, ...atual])

      registrar('criado', `Foto protegida salva com ${quantos} ${quantos === 1 ? 'rosto desfocado' : 'rostos desfocados'}`)
      return foto
    } finally {
      setSalvando(false)
    }
  }

  function recomecar() {
    setFonte(null)
    setRegioes([])
    setEstado('vazio')
    setAviso('')
    setMotor(null)
    imagemRef.current = null
  }

  const totalDesfocados = regioes.filter(r => r.borrar).length

  return {
    fonte, regioes, intensidade, setIntensidade, estado, aviso, motor, salvando,
    totalDesfocados, canvasRef, fotosGaleria,
    escolherImagem, aoEnviarArquivo, alternar, remover, definirTodos,
    marcarManual, exportar, salvarNaGaleria, recomecar
  }
}
