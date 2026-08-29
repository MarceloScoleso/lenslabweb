/**
 * seed.js
 * Popula o app com dados de exemplo.
 *
 * Serve para que o projeto possa ser avaliado sem depender de webcam
 * e sem que o avaliador precise gerar conteúdo antes de ver o produto.
 *
 * As imagens simulam o que um estudante realmente fotografaria: a lousa,
 * a página do caderno, a lâmina no microscópio. A foto do microscópio vem
 * do protótipo da Sprint 2 (assets/galeria); as demais foram desenhadas
 * para este seed, porque as fotos restantes do protótipo eram paisagens e
 * contradiziam o enunciado exibido no card.
 */

import { gerarResumo, gerarFlashcards, gerarQuiz, gerarPassos } from '../utils/ia-mock.js'
import { gerarId } from '../utils/math-utils.js'

const HORA = 60 * 60 * 1000

const EXEMPLOS = [
  {
    tipo: 'nota',
    materia: 'Química',
    imagem: '/assets/slides/lousa-quimica.svg',
    modoCaptura: 'lousa',
    contexto: 'Tabela de reagentes e produtos da aula sobre reações de neutralização, com o balanceamento feito na lousa.',
    haHoras: 2,
    quiz: { acertos: 3, total: 4 }
  },
  {
    tipo: 'nota',
    materia: 'Biologia',
    imagem: '/assets/slides/macro.webp',
    modoCaptura: 'macro',
    contexto: 'Lâmina no microscópio durante a prática de citologia, com a objetiva de 100x e o registro das estruturas observadas.',
    haHoras: 26
  },
  {
    tipo: 'exercicio',
    materia: 'Física',
    imagem: '/assets/slides/caderno-fisica.svg',
    modoCaptura: 'caderno',
    enunciado: 'Um corpo é lançado verticalmente para cima com velocidade inicial de 20 m/s. Calcule a altura máxima atingida.',
    haHoras: 5,
    acertou: true,
    dicasUsadas: 1,
    limiteSegundos: 120
  },
  {
    tipo: 'exercicio',
    materia: 'Matemática',
    imagem: '/assets/slides/caderno-matematica.svg',
    modoCaptura: 'caderno',
    enunciado: 'Determine a área da região delimitada pela curva y = x² e pela reta y = 4 no intervalo dado.',
    haHoras: 30,
    acertou: false,
    dicasUsadas: 3
  }
]

/**
 * Monta as três listas (fotos, notas, exercícios) a partir dos exemplos.
 * O campo dataURL da foto aceita tanto base64 quanto um caminho de arquivo,
 * porque ele é usado apenas como src de <img>.
 */
export function gerarDadosExemplo() {
  const agora = Date.now()
  const fotos = []
  const notas = []
  const exercicios = []

  EXEMPLOS.forEach(exemplo => {
    const timestamp = agora - exemplo.haHoras * HORA
    const foto = {
      id: gerarId('foto'),
      dataURL: exemplo.imagem,
      modo: exemplo.tipo === 'nota' ? 'estuda' : 'resolve',
      modoCaptura: exemplo.modoCaptura,
      materia: exemplo.materia,
      criadaEm: new Date(timestamp).toISOString()
    }
    fotos.push(foto)

    if (exemplo.tipo === 'nota') {
      notas.push({
        id: gerarId('nota'),
        exemplo: true,
        materia: exemplo.materia,
        contexto: exemplo.contexto,
        fotoId: foto.id,
        recursos: {
          resumo: gerarResumo(exemplo.materia, exemplo.contexto),
          flashcards: gerarFlashcards(exemplo.materia, exemplo.contexto, 5),
          quiz: gerarQuiz(exemplo.materia, 4)
        },
        resultadoQuiz: exemplo.quiz
          ? { ...exemplo.quiz, percentual: Math.round((exemplo.quiz.acertos / exemplo.quiz.total) * 100), respostas: [] }
          : null,
        timestamp,
        tempoProcessamento: 1800 + Math.round(Math.random() * 1200)
      })
    } else {
      // Tempos por passo plausíveis, para o card e o resumo já nascerem
      // com o cronômetro preenchido
      const acoes = gerarPassos(exemplo.materia, exemplo.enunciado).map(p => ({
        passo: p.numero,
        acao: p.descricao.split('.')[0] + '.',
        segundos: 35 + Math.floor(Math.random() * 70)
      }))

      exercicios.push({
        id: gerarId('exercicio'),
        exemplo: true,
        materia: exemplo.materia,
        enunciado: exemplo.enunciado,
        fotoId: foto.id,
        passosConcluidos: 4,
        dicasUsadas: exemplo.dicasUsadas,
        acertou: exemplo.acertou,
        acoes,
        limiteSegundos: exemplo.limiteSegundos ?? null,
        tempoTotalSegundos: acoes.reduce((total, a) => total + a.segundos, 0),
        tempoProcessamento: 1300 + Math.round(Math.random() * 900),
        timestamp
      })
    }
  })

  return { fotos, notas, exercicios }
}
