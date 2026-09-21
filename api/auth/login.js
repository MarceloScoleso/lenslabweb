/**
 * POST /api/auth/login
 * Corpo: { email, senha }
 * Resposta 200: { token, usuario }
 */
import { enviarJson, erro, exigirMetodo, lerCorpo, aguardar } from '../_lib/http.js'
import { autenticar, emitirToken } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (!exigirMetodo(req, res, 'POST')) return

  const { email, senha } = await lerCorpo(req)
  if (!email || !senha) return erro(res, 400, 'Informe e-mail e senha.')

  await aguardar(400)

  const usuario = autenticar(email, senha)
  if (!usuario) return erro(res, 401, 'E-mail ou senha incorretos.')

  enviarJson(res, 200, { token: emitirToken(usuario), usuario })
}
