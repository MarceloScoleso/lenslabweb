/**
 * geracao.js
 * Camada de geração de conteúdo da API.
 *
 * Reaproveita os geradores de src/utils/ia-mock.js, que agora rodam no
 * servidor e não mais no navegador. Em produção, é aqui que entraria a
 * chamada ao modelo de IA real: o front não precisaria mudar nada, porque
 * o contrato das rotas /api/estudar e /api/resolver continua o mesmo.
 */
export {
  gerarResumo,
  gerarFlashcards,
  gerarQuiz,
  gerarPassos
} from '../../src/utils/ia-mock.js'

export const MATERIAS = [
  { id: 'matematica', nome: 'Matemática', cor: '#00C896', modos: ['estuda', 'resolve'] },
  { id: 'fisica', nome: 'Física', cor: '#4CC9E0', modos: ['estuda', 'resolve'] },
  { id: 'quimica', nome: 'Química', cor: '#F2C14E', modos: ['estuda', 'resolve'] },
  { id: 'biologia', nome: 'Biologia', cor: '#7ED957', modos: ['estuda', 'resolve'] },
  { id: 'historia', nome: 'História', cor: '#FD79A8', modos: ['estuda'] },
  { id: 'portugues', nome: 'Português', cor: '#A29BFE', modos: ['estuda'] }
]

export function materiaValida(nome, modo) {
  return MATERIAS.some(m => m.nome === nome && (!modo || m.modos.includes(modo)))
}
