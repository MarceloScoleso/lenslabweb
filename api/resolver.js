/**
 * POST /api/resolver  (rota privada)
 * Corpo: { materia, enunciado }
 * Resposta 200: { passos, tempoProcessamento }
 *
 * Gera os passos guiados do modo Resolve Aqui. A API nunca devolve a
 * resposta final do exercício: só os passos e as dicas, coerente com o
 * princípio do produto de conduzir o raciocínio sem entregar o resultado.
 */
import { enviarJson, erro, exigirMetodo, lerCorpo, aguardar } from './_lib/http.js'
import { exigirUsuario } from './_lib/auth.js'
import { gerarPassos, materiaValida } from './_lib/geracao.js'

export default async function handler(req, res) {
  if (!exigirMetodo(req, res, 'POST')) return
  if (!exigirUsuario(req, res)) return

  const { materia, enunciado } = await lerCorpo(req)

  if (!materiaValida(materia, 'resolve')) return erro(res, 422, 'Matéria inválida para este modo.')
  if (typeof enunciado !== 'string' || enunciado.trim().length < 10) {
    return erro(res, 422, 'O enunciado precisa ter pelo menos 10 caracteres.')
  }

  const inicio = Date.now()
  await aguardar(900 + Math.floor(Math.random() * 1100))

  enviarJson(res, 200, {
    passos: gerarPassos(materia, enunciado.trim()),
    tempoProcessamento: Date.now() - inicio
  })
}
