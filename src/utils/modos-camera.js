/**
 * modos.js
 * Modos de captura da câmera, portados de js/camera.js da Sprint 2.
 *
 * Cada modo é um filtro CSS aplicado ao preview e gravado na foto pelo
 * mesmo caminho (ctx.filter no canvas de captura), então o que o usuário
 * vê no visor é exatamente o que sai na imagem salva.
 *
 * Estes são os modos genéricos que qualquer câmera tem. O diferencial do
 * LensLab — Estuda Comigo e Resolve Aqui — não vive aqui: é o destino da
 * foto, escolhido na barra inferior da câmera.
 */

export const MODOS = {
  foto: {
    nome: 'Foto',
    icone: 'camera',
    cor: '#E9EFED',
    filtro: 'none',
    descricao: 'Sem tratamento'
  },
  doc: {
    nome: 'Documento',
    icone: 'documento',
    cor: '#00C896',
    filtro: 'contrast(1.4) brightness(1.05) saturate(0)',
    descricao: 'Texto nítido em preto e branco'
  },
  portrait: {
    nome: 'Retrato',
    icone: 'pessoa',
    cor: '#FD79A8',
    filtro: 'saturate(1.15) contrast(1.05)',
    descricao: 'Tons de pele mais quentes'
  },
  night: {
    nome: 'Noturno',
    icone: 'lua',
    cor: '#F2C14E',
    filtro: 'brightness(1.4) contrast(1.15) saturate(1.1)',
    descricao: 'Clareia cenas escuras'
  },
  caderno: {
    nome: 'Caderno',
    icone: 'caderno',
    cor: '#4CC9E0',
    filtro: 'contrast(1.5) brightness(1.1) grayscale(0.7)',
    descricao: 'Digitalizar anotações à mão'
  },
  lousa: {
    nome: 'Lousa',
    icone: 'lousa',
    cor: '#81ECEC',
    filtro: 'contrast(2) brightness(1.15) saturate(0.2)',
    descricao: 'Quadro branco sem reflexo'
  },
  qrcode: {
    nome: 'QR Code',
    icone: 'qrcode',
    cor: '#74B9FF',
    filtro: 'contrast(1.6) saturate(0)',
    descricao: 'Ler códigos QR e de barras'
  },
  macro: {
    nome: 'Macro',
    icone: 'flor',
    cor: '#FFEAA7',
    filtro: 'contrast(1.3) saturate(1.2)',
    descricao: 'Detalhes bem de perto'
  },
  panorama: {
    nome: 'Panorama',
    icone: 'panorama',
    cor: '#55EFC4',
    filtro: 'saturate(1.2) contrast(1.05)',
    descricao: 'Paisagens amplas'
  },
  comida: {
    nome: 'Comida',
    icone: 'comida',
    cor: '#E17055',
    filtro: 'saturate(1.5) contrast(1.1) brightness(1.05)',
    descricao: 'Cores mais vibrantes'
  },
  hdr: {
    nome: 'HDR',
    icone: 'brilho',
    cor: '#FD79A8',
    filtro: 'contrast(1.3) saturate(1.4) brightness(1.05)',
    descricao: 'Alto alcance dinâmico'
  },
  selfie: {
    nome: 'Selfie+',
    icone: 'selfie',
    cor: '#E056C1',
    filtro: 'saturate(1.15) brightness(1.08) contrast(0.95)',
    descricao: 'Suaviza e ilumina'
  },
  slowmo: {
    nome: 'Câmera Lenta',
    icone: 'slowmo',
    cor: '#FF7675',
    filtro: 'saturate(1.1) hue-rotate(-5deg)',
    descricao: 'Prévia do modo de vídeo lento'
  },
  timelapse: {
    nome: 'Time-lapse',
    icone: 'ampulheta',
    cor: '#A29BFE',
    filtro: 'saturate(1.1) brightness(1.05)',
    descricao: 'Prévia do modo acelerado'
  }
}

/** Os três modos que aparecem como chip fixo acima da barra inferior. */
export const MODOS_RAPIDOS = ['doc', 'portrait', 'night']

/** Ordem da folha "todos os modos" (o modo Foto fica fora: é o padrão). */
export const TODOS_OS_MODOS = Object.keys(MODOS).filter(slug => slug !== 'foto')

/**
 * Destinos da foto. É aqui que os dois modos do LensLab entram: capturar
 * com um deles selecionado leva direto para a tela correspondente.
 */
export const DESTINOS = [
  { id: 'foto', rotulo: 'Foto', descricao: 'Escolher o que fazer depois' },
  { id: 'estuda', rotulo: 'Estuda Comigo', descricao: 'Vira resumo, flashcards e quiz' },
  { id: 'resolve', rotulo: 'Resolve Aqui', descricao: 'Vira resolução guiada' }
]

export const AJUSTES_PADRAO = { brilho: 100, saturacao: 100, contraste: 100 }

export const OPCOES_PROPORCAO = [
  { id: 'full', rotulo: 'Cheio' },
  { id: '3-4', rotulo: '3:4' },
  { id: '1-1', rotulo: '1:1' },
  { id: '9-16', rotulo: '9:16' },
  { id: '16-9', rotulo: '16:9' }
]

export const OPCOES_TIMER = [0, 3, 5, 10]

export const OPCOES_ZOOM = [0.5, 1, 2]

/**
 * Monta a string de filtro CSS combinando o modo e os ajustes manuais.
 * O mesmo valor vai para o style do <video> e para o ctx.filter do canvas.
 */
export function montarFiltro(slug, ajustes) {
  const modo = MODOS[slug] || MODOS.foto
  const base = modo.filtro && modo.filtro !== 'none' ? modo.filtro : ''
  const manual =
    `brightness(${ajustes.brilho / 100})` +
    ` saturate(${ajustes.saturacao / 100})` +
    ` contrast(${ajustes.contraste / 100})`

  return `${base} ${manual}`.trim()
}
