/**
 * photos.js
 * Serviço de armazenamento das capturas.
 *
 * Porte do módulo LensLabPhotos do protótipo da Sprint 2 (js/photos.js),
 * mantendo a mesma chave de storage e o mesmo formato de dados.
 *
 * Este é um protótipo acadêmico, então as fotos ficam no próprio
 * localStorage, que tem cerca de 5 MB. Três regras simples bastam para
 * isso nunca virar problema no uso real do produto:
 *
 *   1. toda captura é reduzida para no máximo 720px no maior lado e
 *      reencodada em JPEG, o que dá algo entre 40 e 80 KB por foto —
 *      resolução de sobra para a miniatura do card e para a prévia;
 *   2. guardamos as MAX_FOTOS capturas mais recentes;
 *   3. se mesmo assim a cota estourar, salvar() lança um erro com texto
 *      legível, e a tela de câmera mostra esse texto para o usuário em vez
 *      de falhar em silêncio.
 *
 * As fotos também são apagadas junto com o item na exclusão definitiva
 * da Galeria, então na prática a lista se mantém pequena sozinha.
 *
 * Formato de uma foto:
 * {
 *   id:           "foto_<timestamp>_<random>",
 *   dataURL:      "data:image/jpeg;base64,...",
 *   modo:         "estuda" | "resolve" | "foto",   // destino escolhido
 *   modoCaptura:  "doc" | "lousa" | ... | null,    // modo da câmera
 *   materia:      string | null,
 *   criadaEm:     "2026-08-28T14:32:11.123Z"
 * }
 *
 * `modo` é para onde a foto foi (o destino) e `modoCaptura` é como ela foi
 * tirada. O segundo acompanha a foto até o material gerado e a Galeria,
 * para que a escolha feita na câmera continue significando algo depois.
 */

import { gerarId } from '../utils/math-utils.js'

const CHAVE_LISTA = 'lenslab:photos'
const LADO_MAX = 720
const QUALIDADE_JPG = 0.72
const MAX_FOTOS = 30

export function lerLista() {
  try {
    const bruto = window.localStorage.getItem(CHAVE_LISTA)
    const lista = bruto ? JSON.parse(bruto) : []
    return Array.isArray(lista) ? lista : []
  } catch (erro) {
    console.warn('[photos] Erro ao ler a lista:', erro)
    return []
  }
}

/** Grava a lista. Devolve false quando a cota do navegador estoura. */
function escreverLista(lista) {
  try {
    window.localStorage.setItem(CHAVE_LISTA, JSON.stringify(lista))
    return true
  } catch (erro) {
    console.warn('[photos] Erro ao gravar a lista:', erro)
    return false
  }
}

/**
 * Reduz a imagem para no máximo LADO_MAX na maior dimensão e reencoda
 * em JPEG. Se a imagem não carregar, devolve o original.
 */
function comprimir(dataURL) {
  return new Promise((resolve) => {
    const img = new Image()

    img.onload = () => {
      const maior = Math.max(img.width, img.height)
      const escala = maior > LADO_MAX ? LADO_MAX / maior : 1

      const largura = Math.round(img.width * escala)
      const altura = Math.round(img.height * escala)

      const canvas = document.createElement('canvas')
      canvas.width = largura
      canvas.height = altura

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, largura, altura)

      resolve(canvas.toDataURL('image/jpeg', QUALIDADE_JPG))
    }

    img.onerror = () => {
      console.warn('[photos] Compressão falhou, usando a imagem original')
      resolve(dataURL)
    }

    img.src = dataURL
  })
}

/**
 * Salva uma captura, mantendo apenas as MAX_FOTOS mais recentes.
 * Se a cota estourar, descarta as mais antigas até caber; se nem assim
 * couber, lança um erro com mensagem legível para a interface exibir.
 */
export async function salvar(dataURL, modo, extras = {}) {
  if (!dataURL) throw new Error('dataURL é obrigatório')

  const foto = {
    id: gerarId('foto'),
    dataURL: await comprimir(dataURL),
    modo: modo || 'foto',
    modoCaptura: extras.modoCaptura || null,
    materia: extras.materia || null,
    criadaEm: new Date().toISOString()
  }

  const lista = [foto, ...lerLista()].slice(0, MAX_FOTOS)

  while (lista.length > 0) {
    if (escreverLista(lista)) return foto
    lista.pop()
  }

  throw new Error(
    'Não foi possível salvar a foto: o armazenamento do navegador está cheio. ' +
    'Exclua alguns itens da Galeria e tente de novo.'
  )
}

export function obter(id) {
  return lerLista().find(f => f.id === id) || null
}

export function excluir(id) {
  return escreverLista(lerLista().filter(f => f.id !== id))
}

/** Insere várias fotos de uma vez (usado pelos dados de exemplo). */
export function adicionarVarias(fotos) {
  return escreverLista([...fotos, ...lerLista()].slice(0, MAX_FOTOS))
}
