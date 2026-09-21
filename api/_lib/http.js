/**
 * http.js
 * Utilitários compartilhados pelas funções da API.
 *
 * Arquivos em pastas iniciadas por "_" não viram rotas na Vercel,
 * então este módulo é importado pelas funções mas não fica exposto.
 */

export function enviarJson(res, status, corpo) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(corpo))
}

export function erro(res, status, mensagem) {
  enviarJson(res, status, { erro: mensagem })
}

/**
 * Garante o método HTTP esperado. Devolve false (e já responde 405)
 * quando o método não é permitido.
 */
export function exigirMetodo(req, res, ...metodos) {
  if (metodos.includes(req.method)) return true
  res.setHeader('Allow', metodos.join(', '))
  erro(res, 405, `Método ${req.method} não permitido.`)
  return false
}

/**
 * Lê o corpo JSON da requisição.
 * Na Vercel o corpo já chega em req.body; no servidor local do Vite
 * ele é lido do stream. Os dois caminhos devolvem o mesmo objeto.
 */
export async function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }

  const partes = []
  for await (const parte of req) partes.push(parte)
  const bruto = Buffer.concat(partes).toString('utf8')
  if (!bruto) return {}
  try { return JSON.parse(bruto) } catch { return {} }
}

/** Latência artificial, para o front poder exibir o estado de carregamento. */
export function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
