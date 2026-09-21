/**
 * GET /api/materias
 * Rota pública. Lista as matérias suportadas e em quais modos cada uma
 * está disponível. O front usa esta lista para montar os seletores de
 * matéria do Estuda Comigo e do Resolve Aqui.
 */
import { enviarJson, exigirMetodo } from './_lib/http.js'
import { MATERIAS } from './_lib/geracao.js'

export default function handler(req, res) {
  if (!exigirMetodo(req, res, 'GET')) return
  res.setHeader('Cache-Control', 'public, max-age=300')
  enviarJson(res, 200, { materias: MATERIAS })
}
