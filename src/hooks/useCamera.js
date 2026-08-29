import { useState, useRef, useEffect, useCallback } from 'react'

/** Proporções de recorte disponíveis no menu avançado */
const RAZOES = {
  '1-1': 1,
  '3-4': 3 / 4,
  '9-16': 9 / 16,
  '16-9': 16 / 9
}

/**
 * useCamera - Encapsula o acesso à webcam via getUserMedia.
 *
 * Porte da função iniciarCamera() do protótipo (js/camera.js), mantendo
 * as mesmas constraints e as mesmas mensagens de erro por tipo.
 *
 * A grande diferença em relação ao protótipo: lá o stream era encerrado
 * nos eventos beforeunload/pagehide. Em uma SPA o usuário troca de rota
 * sem descarregar a página, então a webcam ficaria ligada. Aqui o
 * encerramento acontece no cleanup do useEffect.
 */
export function useCamera() {
  const videoEl = useRef(null)
  const streamRef = useRef(null)

  const [facingMode, setFacingMode] = useState('environment')
  const [erro, setErro] = useState(null)
  const [ativa, setAtiva] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  /**
   * Ref em formato de callback, e não um useRef comum.
   *
   * Enquanto a prévia da foto está na tela o <video> é desmontado, e ao
   * refazer a captura o React cria um elemento novo. Com um ref comum esse
   * elemento nascia sem srcObject (o stream só era atribuído dentro do
   * efeito, que não roda de novo), e o visor ficava preto com o botão de
   * captura morto. Aqui o stream é reatado sempre que o elemento aparece.
   */
  const videoRef = useCallback((node) => {
    videoEl.current = node
    if (node && streamRef.current && node.srcObject !== streamRef.current) {
      node.srcObject = streamRef.current
      node.play().catch(() => { /* autoplay bloqueado, ignora */ })
    }
  }, [])

  const pararCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setAtiva(false)
  }, [])

  const aplicarStream = useCallback((stream) => {
    streamRef.current = stream
    if (videoEl.current) {
      videoEl.current.srcObject = stream
      videoEl.current.play().catch(() => { /* autoplay bloqueado, ignora */ })
    }
    setAtiva(true)
    setErro(null)
  }, [])

  useEffect(() => {
    let cancelado = false

    async function iniciar() {
      setErro(null)

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErro('Seu navegador não suporta acesso à câmera. Tente um navegador moderno (Chrome, Edge, Firefox).')
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false
        })

        if (cancelado) {
          stream.getTracks().forEach(t => t.stop())
          return
        }
        aplicarStream(stream)

      } catch (e) {
        if (cancelado) return

        let texto = 'Não foi possível acessar a câmera.'

        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
          texto = 'Permissão negada. Autorize o acesso à câmera nas configurações do site para continuar.'
        } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
          texto = 'Nenhuma câmera encontrada no dispositivo.'
        } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
          texto = 'A câmera está sendo usada por outro aplicativo. Feche-o e tente novamente.'
        } else if (e.name === 'OverconstrainedError') {
          // A câmera pedida não existe: tenta de novo sem a restrição
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
            if (cancelado) {
              stream.getTracks().forEach(t => t.stop())
              return
            }
            aplicarStream(stream)
            return
          } catch (e2) {
            texto = 'A câmera solicitada não está disponível.'
          }
        } else if (e.name === 'SecurityError') {
          texto = 'Acesso bloqueado. Abra a página via http://localhost ou https://, não pelo arquivo direto.'
        }

        console.error('[câmera] Erro ao iniciar:', e)
        setErro(texto)
      }
    }

    iniciar()

    return () => {
      cancelado = true
      pararCamera()
    }
  }, [facingMode, tentativa, aplicarStream, pararCamera])

  const trocarCamera = useCallback(() => {
    setFacingMode(atual => (atual === 'environment' ? 'user' : 'environment'))
  }, [])

  const tentarNovamente = useCallback(() => {
    setTentativa(n => n + 1)
  }, [])

  /**
   * Desenha o frame atual do vídeo em um canvas e devolve o dataURL.
   *
   * Aplica na foto exatamente o que o usuário vê no visor: o filtro do modo
   * somado aos ajustes manuais (ctx.filter), o recorte da proporção
   * escolhida e o zoom. Espelha na câmera frontal, como no protótipo.
   *
   * @param {object} opcoes
   * @param {string} opcoes.filtro    - string de filtro CSS
   * @param {string} opcoes.proporcao - full | 3-4 | 1-1 | 9-16 | 16-9
   * @param {number} opcoes.zoom      - fator de zoom do visor
   */
  const capturarFrame = useCallback((opcoes = {}) => {
    const video = videoEl.current
    if (!video || !video.videoWidth) {
      throw new Error('A câmera ainda não está pronta para capturar.')
    }

    const { filtro = '', proporcao = 'full', zoom = 1 } = opcoes

    const largura = video.videoWidth
    const altura = video.videoHeight

    // 1) Recorte da proporção, centralizado no frame
    let origemLargura = largura
    let origemAltura = altura

    const razao = RAZOES[proporcao]
    if (razao) {
      if (largura / altura > razao) {
        origemLargura = Math.round(altura * razao)
      } else {
        origemAltura = Math.round(largura / razao)
      }
    }

    // O arquivo final mantém o tamanho do recorte da proporção
    const destinoLargura = origemLargura
    const destinoAltura = origemAltura

    // 2) Zoom digital: recorta uma área menor e amplia até o tamanho final.
    //    Abaixo de 1 não há o que ampliar (não dá para inventar campo de
    //    visão), então o 0.5x é só um enquadramento do visor.
    const fator = Math.max(1, zoom)
    origemLargura = Math.round(origemLargura / fator)
    origemAltura = Math.round(origemAltura / fator)

    const origemX = Math.round((largura - origemLargura) / 2)
    const origemY = Math.round((altura - origemAltura) / 2)

    const canvas = document.createElement('canvas')
    canvas.width = destinoLargura
    canvas.height = destinoAltura

    const ctx = canvas.getContext('2d')
    if (filtro) ctx.filter = filtro

    if (facingMode === 'user') {
      ctx.translate(destinoLargura, 0)
      ctx.scale(-1, 1)
    }

    ctx.drawImage(
      video,
      origemX, origemY, origemLargura, origemAltura,
      0, 0, destinoLargura, destinoAltura
    )

    return canvas.toDataURL('image/jpeg', 0.9)
  }, [facingMode])

  return {
    videoRef,
    facingMode,
    erro,
    ativa,
    trocarCamera,
    tentarNovamente,
    capturarFrame,
    pararCamera
  }
}
