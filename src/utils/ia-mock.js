/**
 * ia-mock.js
 * Simula as respostas de IA que o LensLab teria em produção.
 * Usado pelos modos Estuda Comigo e Resolve Aqui.
 */

import { sortear, sortearVarios, gerarId } from './math-utils.js'

const TEMPLATES_TOPICOS = {
  'Matemática': [
    'Definição do conceito principal',
    'Fórmula geral e sua aplicação',
    'Exemplo prático resolvido',
    'Exceções e casos especiais',
    'Relação com outros conceitos'
  ],
  'Física': [
    'Princípio fundamental envolvido',
    'Equações relevantes',
    'Sistema de unidades utilizado',
    'Aplicação prática no cotidiano',
    'Erros comuns a evitar'
  ],
  'Química': [
    'Elementos e reagentes envolvidos',
    'Tipo de reação e mecanismo',
    'Balanceamento da equação',
    'Condições de temperatura e pressão',
    'Produtos formados'
  ],
  'Biologia': [
    'Estrutura biológica principal',
    'Função no organismo',
    'Processos metabólicos relacionados',
    'Importância evolutiva',
    'Aplicações na saúde'
  ],
  'História': [
    'Contexto histórico',
    'Personagens principais',
    'Causas do evento',
    'Consequências imediatas',
    'Impacto no presente'
  ],
  'Português': [
    'Regra gramatical central',
    'Casos de uso comuns',
    'Exceções à regra',
    'Confusões frequentes',
    'Exemplos práticos'
  ]
}

/**
 * Conjuntos de alternativas do quiz.
 *
 * Cada conjunto tem uma afirmação correta e três distratores escritos no
 * mesmo registro. Nenhum texto denuncia a própria condição ("esta está
 * errada"), porque isso entregaria a resposta sem o aluno raciocinar.
 * A posição das alternativas é sorteada em gerarQuiz.
 */
const CONJUNTOS_ALTERNATIVAS = [
  {
    correta: 'Vale sempre que as condições descritas no enunciado forem satisfeitas.',
    incorretas: [
      'Vale apenas quando os valores envolvidos são números inteiros positivos.',
      'Depende da ordem em que os termos aparecem escritos no enunciado.',
      'Tem valor apenas teórico e não se aplica a situações concretas.'
    ]
  },
  {
    correta: 'É um conceito estruturante: serve de base para os tópicos seguintes.',
    incorretas: [
      'É um detalhe complementar, que pode ser ignorado sem prejuízo.',
      'Foi substituído por um modelo mais recente e hoje está em desuso.',
      'Só se aplica ao exemplo específico apresentado em aula.'
    ]
  },
  {
    correta: 'Pode ser conferido comparando o resultado com a ordem de grandeza esperada.',
    incorretas: [
      'Não admite nenhuma forma de verificação depois de calculado.',
      'Só pode ser conferido com o auxílio de uma calculadora científica.',
      'Deve ser aceito como correto sempre que a conta fechar em número redondo.'
    ]
  },
  {
    correta: 'Exige atenção às unidades e às condições iniciais do problema.',
    incorretas: [
      'Independe por completo das unidades utilizadas.',
      'Dispensa a leitura do enunciado quando a fórmula já é conhecida.',
      'Produz o mesmo resultado em qualquer contexto, sem exceção.'
    ]
  },
  {
    correta: 'Relaciona-se diretamente com o que foi observado no material fotografado.',
    incorretas: [
      'Não tem relação com o conteúdo registrado na foto.',
      'Só faz sentido quando analisado isoladamente dos demais tópicos.',
      'Aparece no material apenas como curiosidade histórica.'
    ]
  }
]

const LETRAS = ['A', 'B', 'C', 'D']

const DICAS_GENERICAS = {
  'Matemática': [
    'Reveja a fórmula geral antes de substituir os valores.',
    'Verifique se as unidades estão consistentes.',
    'Faça o desenho ou esquema do problema.'
  ],
  'Física': [
    'Identifique quais grandezas são dadas e qual é a incógnita.',
    'Confira o sistema de unidades (SI).',
    'Analise se a resposta faz sentido fisicamente.'
  ],
  'Química': [
    'Balanceie a equação antes de fazer os cálculos.',
    'Confira as massas molares dos elementos.',
    'Verifique os estados físicos (sólido, líquido, gasoso).'
  ],
  'Biologia': [
    'Relacione a estrutura com a função que ela exerce.',
    'Pense na escala: célula, tecido, órgão, sistema.',
    'Procure a palavra-chave do enunciado.'
  ]
}

/**
 * Gera um resumo estruturado a partir do conteúdo capturado
 */
export function gerarResumo(materia, conteudo) {
  const templates = TEMPLATES_TOPICOS[materia] || TEMPLATES_TOPICOS['Matemática']
  const topicos = sortearVarios(templates, 3)

  return {
    id: gerarId('resumo'),
    titulo: `Resumo de ${materia}`,
    contexto: conteudo.slice(0, 100) + (conteudo.length > 100 ? '...' : ''),
    topicos: topicos.map((t, i) => ({
      numero: i + 1,
      titulo: t,
      descricao: `Este tópico aborda ${t.toLowerCase()} no contexto do material fotografado.`
    })),
    palavrasChave: extrairPalavrasChave(conteudo)
  }
}

/**
 * Gera flashcards no formato pergunta/resposta
 */
export function gerarFlashcards(materia, conteudo, quantidade = 5) {
  const templates = TEMPLATES_TOPICOS[materia] || TEMPLATES_TOPICOS['Matemática']
  const perguntas = sortearVarios(templates, Math.min(quantidade, templates.length))

  return perguntas.map((p, i) => ({
    id: gerarId('card'),
    numero: i + 1,
    pergunta: `O que você sabe sobre "${p.toLowerCase()}"?`,
    resposta: `Conceito importante em ${materia}, extraído do material que você capturou. Relacione com os exemplos vistos em aula.`
  }))
}

/**
 * Gera um quiz de múltipla escolha.
 *
 * Cada questão recebe um tópico e um conjunto de alternativas diferentes,
 * e a ordem das quatro alternativas é sorteada (Math.random via
 * sortearVarios). Sem esse sorteio a correta cairia sempre na letra A e o
 * quiz deixaria de avaliar qualquer coisa.
 */
export function gerarQuiz(materia, quantidade = 4) {
  const templates = TEMPLATES_TOPICOS[materia] || TEMPLATES_TOPICOS['Matemática']
  const topicos = sortearVarios(templates, quantidade)
  const conjuntos = sortearVarios(CONJUNTOS_ALTERNATIVAS, quantidade)

  return Array.from({ length: quantidade }, (_, i) => {
    const topico = topicos[i % topicos.length]
    const conjunto = conjuntos[i % conjuntos.length]

    const embaralhadas = sortearVarios([
      { texto: conjunto.correta, correta: true },
      ...conjunto.incorretas.map(texto => ({ texto, correta: false }))
    ], LETRAS.length)

    return {
      id: gerarId('quiz'),
      numero: i + 1,
      pergunta: `Sobre ${topico.toLowerCase()}, qual afirmação é correta?`,
      alternativas: embaralhadas.map((alternativa, indice) => ({
        id: LETRAS[indice],
        texto: alternativa.texto,
        correta: alternativa.correta
      }))
    }
  })
}

/**
 * Gera passos de resolução para o Resolve Aqui
 */
export function gerarPassos(materia, exercicio) {
  const dicas = DICAS_GENERICAS[materia] || DICAS_GENERICAS['Matemática']

  return [
    {
      numero: 1,
      titulo: 'Identificar o problema',
      descricao: `Leia o enunciado com atenção e identifique o que a questão de ${materia} está pedindo. Sublinhe os dados fornecidos.`,
      dica: sortear(dicas)
    },
    {
      numero: 2,
      titulo: 'Escolher o método',
      descricao: 'Que fórmula ou conceito se aplica aqui? Pense em problemas semelhantes que você já resolveu.',
      dica: sortear(dicas)
    },
    {
      numero: 3,
      titulo: 'Aplicar o método',
      descricao: 'Substitua os valores conhecidos na fórmula escolhida. Atenção aos sinais e unidades.',
      dica: sortear(dicas)
    },
    {
      numero: 4,
      titulo: 'Verificar o resultado',
      descricao: 'O resultado faz sentido no contexto do problema? Compare com a ordem de grandeza esperada.',
      dica: sortear(dicas)
    }
  ]
}

/**
 * Extrai palavras-chave simuladas de um texto
 */
function extrairPalavrasChave(texto) {
  const palavras = texto
    .toLowerCase()
    .replace(/[^\wáàâãéèêíïóôõöúçñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(p => p.length > 4)

  const unicas = [...new Set(palavras)]
  return unicas.slice(0, 5)
}
