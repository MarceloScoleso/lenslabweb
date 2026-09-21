/**
 * GET /api/auth/me
 * Cabeçalho: Authorization: Bearer <token>
 * Resposta 200: { usuario }
 *
 * Usada pelo front ao carregar a página, para confirmar que a sessão
 * salva no navegador ainda é válida.
 */
import { enviarJson, exigirMetodo } from '../_lib/http.js'
import { exigirUsuario } from '../_lib/auth.js'

export default function handler(req, res) {
  if (!exigirMetodo(req, res, 'GET')) return
  const usuario = exigirUsuario(req, res)
  if (!usuario) return
  enviarJson(res, 200, { usuario })
}
