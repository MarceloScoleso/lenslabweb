/**
 * math-utils.js
 * Funções utilitárias usando o objeto Math nativo do JavaScript.
 * Requisito explícito da Sprint 3 (Web Development).
 */

/**
 * Gera um ID aleatório usando Math.random + Math.floor
 */
export function gerarId(prefixo = 'item') {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 100000000)
  return `${prefixo}_${timestamp}_${random}`
}

/**
 * Arredonda um número para X casas decimais usando Math.round e Math.pow
 */
export function arredondar(numero, casas = 2) {
  const fator = Math.pow(10, casas)
  return Math.round(numero * fator) / fator
}

/**
 * Calcula percentual e arredonda para inteiro
 */
export function calcularPercentual(parte, total) {
  if (total === 0) return 0
  return Math.round((parte / total) * 100)
}

/**
 * Sorteia um item aleatório de um array
 */
export function sortear(array) {
  if (!array || array.length === 0) return null
  const indice = Math.floor(Math.random() * array.length)
  return array[indice]
}

/**
 * Sorteia N itens únicos de um array
 */
export function sortearVarios(array, quantidade) {
  const copia = [...array]
  const resultado = []
  const qtd = Math.min(quantidade, copia.length)

  for (let i = 0; i < qtd; i++) {
    const indice = Math.floor(Math.random() * copia.length)
    resultado.push(copia.splice(indice, 1)[0])
  }

  return resultado
}

/**
 * Formata tamanho em bytes para KB/MB usando Math.log e Math.pow
 */
export function formatarTamanho(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const unidades = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const tamanho = arredondar(bytes / Math.pow(k, i), 1)
  return `${tamanho} ${unidades[i]}`
}

/**
 * Formata uma duração em segundos como mm:ss usando Math.floor
 * Usada pelo cronômetro do Resolve Aqui.
 */
export function formatarDuracao(totalSegundos) {
  const seguros = Math.max(0, Math.floor(totalSegundos))
  const minutos = Math.floor(seguros / 60)
  const segundos = seguros % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

/**
 * Calcula tempo relativo (há X minutos, horas, dias) usando Math.floor
 */
export function tempoRelativo(timestamp) {
  const agora = Date.now()
  const diff = agora - timestamp

  const segundos = Math.floor(diff / 1000)
  const minutos = Math.floor(segundos / 60)
  const horas = Math.floor(minutos / 60)
  const dias = Math.floor(horas / 24)

  if (dias > 0) return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`
  if (horas > 0) return `há ${horas} ${horas === 1 ? 'hora' : 'horas'}`
  if (minutos > 0) return `há ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  return 'agora mesmo'
}

/**
 * Calcula estatísticas de um array de números usando Math.max e Math.min
 */
export function calcularEstatisticas(numeros) {
  if (!numeros || numeros.length === 0) {
    return { total: 0, media: 0, max: 0, min: 0 }
  }

  const total = numeros.reduce((acc, n) => acc + n, 0)
  const media = arredondar(total / numeros.length, 1)
  const max = Math.max(...numeros)
  const min = Math.min(...numeros)

  return { total, media, max, min }
}

/**
 * Simula um tempo de processamento aleatório (para efeito de UX)
 */
export function tempoAleatorio(min = 800, max = 2000) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
