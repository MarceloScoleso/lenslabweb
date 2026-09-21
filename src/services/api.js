/**
 * api.js
 * Cliente HTTP da aplicação. Todas as chamadas à API passam por aqui.
 *
 * Responsabilidades:
 *  - anexar o token de sessão no cabeçalho Authorization
 *  - aplicar timeout (AbortController), para a tela nunca ficar presa
 *  - converter respostas de erro em ApiError, com mensagem legível
 *  - avisar a aplicação quando a sessão expira (evento 'lenslab:sessao-expirada')
 */

const CHAVE_SESSAO = 'lenslab_sessao'
const TIMEOUT_MS = 15000

export class ApiError extends Error {
  constructor(mensagem, status) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

export function lerSessao() {
  try {
    return JSON.parse(window.localStorage.getItem(CHAVE_SESSAO)) || null
  } catch {
    return null
  }
}

export function gravarSessao(sessao) {
  try {
    if (sessao) window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    else window.localStorage.removeItem(CHAVE_SESSAO)
  } catch {
    /* modo privado ou armazenamento cheio: a sessão vive só na memória */
  }
}

async function requisitar(caminho, { metodo = 'GET', corpo, sinal } = {}) {
  const controlador = new AbortController()
  const timeout = setTimeout(() => controlador.abort(), TIMEOUT_MS)
  if (sinal) sinal.addEventListener('abort', () => controlador.abort())

  const cabecalhos = { Accept: 'application/json' }
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json'

  const sessao = lerSessao()
  if (sessao?.token) cabecalhos.Authorization = `Bearer ${sessao.token}`

  let resposta
  try {
    resposta = await fetch(`/api${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controlador.signal
    })
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new ApiError(sinal?.aborted ? 'Requisição cancelada.' : 'O servidor demorou para responder. Tente novamente.', 0)
    }
    throw new ApiError('Sem conexão com o servidor. Verifique sua internet.', 0)
  } finally {
    clearTimeout(timeout)
  }

  let dados = null
  try { dados = await resposta.json() } catch { /* resposta sem corpo */ }

  if (!resposta.ok) {
    if (resposta.status === 401 && sessao?.token) {
      window.dispatchEvent(new CustomEvent('lenslab:sessao-expirada'))
    }
    throw new ApiError(dados?.erro || `Erro ${resposta.status} na API.`, resposta.status)
  }

  return dados
}

/* ---------------------------------------------------------------- rotas */

export const api = {
  login: (email, senha) => requisitar('/auth/login', { metodo: 'POST', corpo: { email, senha } }),
  eu: sinal => requisitar('/auth/me', { sinal }),
  materias: sinal => requisitar('/materias', { sinal }),
  estudar: (materia, conteudo, sinal) =>
    requisitar('/estudar', { metodo: 'POST', corpo: { materia, conteudo }, sinal }),
  resolver: (materia, enunciado, sinal) =>
    requisitar('/resolver', { metodo: 'POST', corpo: { materia, enunciado }, sinal })
}
