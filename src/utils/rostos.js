/**
 * rostos.js
 * Detecção de rostos e desfoque de regiões de uma imagem.
 *
 * Detecção, em ordem de preferência:
 *   1. FaceDetector nativo do navegador (Shape Detection API), quando existe
 *   2. MediaPipe Face Detector, carregado sob demanda (só nesta tela)
 * Se nenhum funcionar, a tela continua útil com a marcação manual.
 *
 * As regiões são devolvidas em coordenadas normalizadas (0 a 1), para não
 * depender do tamanho em que a imagem está sendo exibida.
 */

const VERSAO_MEDIAPIPE = '1.0.1'
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSAO_MEDIAPIPE}/wasm`
const MODELO_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'

let detectorMediaPipe = null

async function carregarMediaPipe() {
  if (detectorMediaPipe) return detectorMediaPipe
  const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision')
  const visao = await FilesetResolver.forVisionTasks(WASM_URL)
  detectorMediaPipe = await FaceDetector.createFromOptions(visao, {
    baseOptions: { modelAssetPath: MODELO_URL, delegate: 'CPU' },
    runningMode: 'IMAGE',
    minDetectionConfidence: 0.5
  })
  return detectorMediaPipe
}

/** Normaliza e aplica uma margem, porque a caixa do detector corta cabelo e queixo. */
function normalizar(x, y, w, h, larguraImg, alturaImg) {
  const margem = 0.18
  const nx = Math.max(0, x - w * margem)
  const ny = Math.max(0, y - h * margem * 1.4)
  const nw = Math.min(larguraImg - nx, w * (1 + margem * 2))
  const nh = Math.min(alturaImg - ny, h * (1 + margem * 2.4))
  return { x: nx / larguraImg, y: ny / alturaImg, w: nw / larguraImg, h: nh / alturaImg }
}

/**
 * Detecta rostos numa <img> já carregada.
 * @returns {Promise<{ regioes: Array, motor: 'nativo'|'mediapipe' }>}
 */
export async function detectarRostos(imagem) {
  const L = imagem.naturalWidth
  const A = imagem.naturalHeight

  if ('FaceDetector' in window) {
    try {
      const detector = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 20 })
      const faces = await detector.detect(imagem)
      return {
        motor: 'nativo',
        regioes: faces.map(f => normalizar(f.boundingBox.x, f.boundingBox.y,
          f.boundingBox.width, f.boundingBox.height, L, A))
      }
    } catch {
      /* segue para o MediaPipe */
    }
  }

  const detector = await carregarMediaPipe()
  const { detections } = detector.detect(imagem)
  return {
    motor: 'mediapipe',
    regioes: detections.map(d => {
      const b = d.boundingBox
      return normalizar(b.originX, b.originY, b.width, b.height, L, A)
    })
  }
}

/**
 * Desenha a imagem no canvas com as regiões marcadas desfocadas.
 *
 * O desfoque é feito reduzindo a região e ampliando de volta com suavização,
 * duas vezes. Funciona em todos os navegadores, inclusive no Safari, que
 * ignora ctx.filter.
 *
 * @param {number} intensidade de 1 a 10
 */
export function renderizarComDesfoque(canvas, imagem, regioes, intensidade = 6) {
  const L = imagem.naturalWidth
  const A = imagem.naturalHeight
  canvas.width = L
  canvas.height = A

  const ctx = canvas.getContext('2d')
  ctx.drawImage(imagem, 0, 0, L, A)

  const fator = 4 + Math.round(intensidade * 2.4)
  const temp = document.createElement('canvas')
  const tctx = temp.getContext('2d')

  regioes.filter(r => r.borrar).forEach(r => {
    const x = Math.round(r.x * L)
    const y = Math.round(r.y * A)
    const w = Math.max(1, Math.round(r.w * L))
    const h = Math.max(1, Math.round(r.h * A))

    const pw = Math.max(1, Math.round(w / fator))
    const ph = Math.max(1, Math.round(h / fator))
    temp.width = pw
    temp.height = ph
    tctx.imageSmoothingEnabled = true
    tctx.imageSmoothingQuality = 'high'

    ctx.save()
    ctx.beginPath()
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.clip()
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    for (let passada = 0; passada < 2; passada++) {
      tctx.clearRect(0, 0, pw, ph)
      tctx.drawImage(canvas, x, y, w, h, 0, 0, pw, ph)
      ctx.drawImage(temp, 0, 0, pw, ph, x, y, w, h)
    }
    ctx.restore()
  })
}
