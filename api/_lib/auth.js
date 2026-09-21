/**
 * auth.js
 * Autenticação da API do LensLab.
 *
 * Os tokens são assinados com HMAC-SHA256 (payload.assinatura, ambos em
 * base64url). Não há banco de dados: os usuários de teste ficam listados
 * abaixo e estão documentados no README.
 *
 * O segredo vem da variável de ambiente LENSLAB_SECRET. Sem ela, é usado
 * um valor padrão, o que é aceitável num projeto acadêmico mas deve ser
 * trocado em qualquer uso real.
 */
import crypto from 'node:crypto'
import { erro } from './http.js'

const SEGREDO = process.env.LENSLAB_SECRET || 'lenslab-sprint4-segredo-academico'
const VALIDADE_MS = 8 * 60 * 60 * 1000 // 8 horas

const USUARIOS = [
  {
    id: 'u1',
    nome: 'Estudante Demo',
    email: 'estudante@lenslab.com',
    senha: 'lenslab123',
    curso: 'Engenharia de Software'
  },
  {
    id: 'u2',
    nome: 'Professor Avaliador',
    email: 'professor@lenslab.com',
    senha: 'fiap2026',
    curso: 'FIAP'
  }
]

const b64url = texto => Buffer.from(texto).toString('base64url')

function assinar(conteudo) {
  return crypto.createHmac('sha256', SEGREDO).update(conteudo).digest('base64url')
}

/** Remove a senha antes de devolver o usuário para o cliente. */
function publico({ senha, ...resto }) {
  return resto
}

export function autenticar(email, senha) {
  const alvo = String(email || '').trim().toLowerCase()
  const usuario = USUARIOS.find(u => u.email === alvo && u.senha === senha)
  return usuario ? publico(usuario) : null
}

export function emitirToken(usuario) {
  const payload = b64url(JSON.stringify({ sub: usuario.id, exp: Date.now() + VALIDADE_MS }))
  return `${payload}.${assinar(payload)}`
}

export function validarToken(token) {
  if (!token || !token.includes('.')) return null
  const [payload, assinatura] = token.split('.')

  const esperada = assinar(payload)
  const a = Buffer.from(assinatura)
  const b = Buffer.from(esperada)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    const dados = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!dados.exp || dados.exp < Date.now()) return null
    const usuario = USUARIOS.find(u => u.id === dados.sub)
    return usuario ? publico(usuario) : null
  } catch {
    return null
  }
}

/**
 * Protege uma rota: devolve o usuário autenticado ou responde 401
 * e devolve null, encerrando o handler.
 */
export function exigirUsuario(req, res) {
  const cabecalho = req.headers.authorization || ''
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null
  const usuario = validarToken(token)
  if (!usuario) {
    erro(res, 401, 'Sessão inválida ou expirada. Faça login novamente.')
    return null
  }
  return usuario
}
