/**
 * POST /api/estudar  (rota privada)
 * Corpo: { materia, conteudo }
 * Resposta 200: { resumo, flashcards, quiz, tempoProcessamento }
 *
 * Gera o material do modo Estuda Comigo. O tempo de processamento é
 * medido no servidor e devolvido, porque é o indicador da promessa
 * central do produto: menos de 30 segundos entre a foto e o material.
 */
import { enviarJson, erro, exigirMetodo, lerCorpo, aguardar } from './_lib/http.js'
import { exigirUsuario } from './_lib/auth.js'
import { gerarResumo, gerarFlashcards, gerarQuiz, materiaValida } from './_lib/geracao.js'

export default async function handler(req, res) {
  if (!exigirMetodo(req, res, 'POST')) return
  if (!exigirUsuario(req, res)) return

  const { materia, conteudo } = await lerCorpo(req)

  if (!materiaValida(materia, 'estuda')) return erro(res, 422, 'Matéria inválida para este modo.')
  if (typeof conteudo !== 'string' || conteudo.trim().length < 10) {
    return erro(res, 422, 'O conteúdo precisa ter pelo menos 10 caracteres.')
  }

  const inicio = Date.now()
  // Simula o tempo de OCR + geração que um modelo real levaria
  await aguardar(1200 + Math.floor(Math.random() * 1300))

  const texto = conteudo.trim()
  enviarJson(res, 200, {
    resumo: gerarResumo(materia, texto),
    flashcards: gerarFlashcards(materia, texto, 5),
    quiz: gerarQuiz(materia, 4),
    tempoProcessamento: Date.now() - inicio
  })
}
