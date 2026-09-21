/**
 * landing.js - Conteúdo da landing page (Sprint 3) em forma de dados.
 *
 * As seções da landing são componentes puros de apresentação: recebem
 * estes objetos por props e não sabem de onde o conteúdo veio. Trocar um
 * texto aqui muda a página inteira, sem tocar em JSX.
 */

export const hero = {
  selo: 'Parceria JOVI Smartphone',
  titulo: 'A câmera que ',
  tituloDestaque: 'ensina',
  tituloFim: ', não entrega.',
  subtitulo:
    'O LensLab transforma qualquer foto de material de estudo em resumo, flashcards e quiz — em menos de 30 segundos.',
  acoes: {
    // O CTA principal deixou de ser âncora: agora entra no app (ou no painel,
    // se já houver sessão). O "Ver em ação" da Sprint 3 virou a âncora do Header.
    primaria: { label: 'Começar agora', labelAutenticado: 'Ir para o painel' },
    secundaria: { href: '#solucao', label: 'Conhecer a solução' }
  },
  stats: [
    { id: 'tempo', valor: '30s', descricao: 'foto → estudo pronto' },
    { id: 'modos', valor: '3', descricao: 'modos exclusivos' },
    { id: 'app', valor: '1', descricao: 'único app' }
  ],
  mockup: {
    cabecalho: 'Câmera Inteligente',
    deteccao: '📚 Caderno detectado',
    pergunta: 'Estudar com isso?',
    botao: 'Estuda Comigo'
  }
}

export const solucao = {
  tag: 'A Solução',
  titulo: 'Photomath responde. ChatGPT explica. ',
  tituloDestaque: 'LensLab ensina.',
  lead:
    'Câmeras de celular viraram menus complexos. Estudantes fotografam material o dia inteiro, mas ainda perdem 10 a 15 minutos até conseguir estudar. A gente resolve isso.',
  problema: {
    icone: '😫',
    titulo: 'O problema hoje',
    texto:
      'O estudante tira foto do slide, sai do app, abre o ChatGPT, copia o que consegue, cola no Notion, tenta gerar flashcards no Quizlet... até estudar de verdade, já perdeu o tempo.',
    metricaValor: '10 a 15 min',
    metricaTexto: ' só de preparo'
  },
  resolucao: {
    icone: '✨',
    titulo: 'Com o LensLab',
    texto:
      'Uma foto. Um app. O material já vira resumo, flashcards e quiz automaticamente, organizado por matéria. Se travar no exercício, o app te guia passo a passo sem entregar a resposta.',
    metricaValor: 'Menos de 30 segundos',
    metricaTexto: ' até o estudo'
  },
  modosTitulo: 'Três modos, três momentos do estudante',
  modos: [
    {
      id: 'estuda',
      tag: 'Absorver',
      icone: '📖',
      titulo: 'Estuda Comigo',
      texto:
        'Fotografa slide, caderno ou lousa e recebe resumo, flashcards e quiz automaticamente. Tudo organizado por matéria.',
      situacao: 'Disponível',
      ativo: true
    },
    {
      id: 'resolve',
      tag: 'Praticar',
      icone: '🧮',
      titulo: 'Resolve Aqui',
      texto:
        'Fotografa o exercício travado e o app te guia passo a passo. Sem entregar a resposta pronta. Só dicas quando você pedir.',
      situacao: 'Disponível',
      ativo: true
    },
    {
      id: 'privacidade',
      tag: 'Socializar',
      icone: '🛡️',
      titulo: 'Privacidade Estudante',
      texto:
        'Antes de postar aquela foto no story, o app detecta cada rosto e você decide, um por um, quais borrar.',
      // Era "Em breve" na Sprint 3: o modo foi implementado nesta Sprint.
      situacao: 'Disponível',
      ativo: true
    }
  ]
}

export const publico = {
  tag: 'Público-Alvo',
  titulo: 'Feito para quem ',
  tituloDestaque: 'estuda de verdade',
  lead:
    'Ensino médio, cursinho, graduação. Sala de aula, biblioteca, ônibus, quarto às 23h antes da prova.',
  personas: [
    {
      id: 'idade',
      avatar: '👩‍🎓',
      titulo: 'Estudantes de 16 a 25 anos',
      texto:
        'Do último ano do ensino médio ao final da graduação. Vestibulandos, universitários, autodidatas.'
    },
    {
      id: 'digitais',
      avatar: '📱',
      titulo: 'Nativos digitais',
      texto:
        'Usam o celular como principal ferramenta de estudo. Trocam de app 5 vezes antes de conseguir estudar.'
    },
    {
      id: 'tempo',
      avatar: '⏰',
      titulo: 'Com tempo curto',
      texto:
        'Estudam entre uma aula e outra, no transporte, na fila. Precisam de material pronto rápido.'
    },
    {
      id: 'aprender',
      avatar: '🧠',
      titulo: 'Querem aprender de verdade',
      texto:
        'Cansaram de respostas prontas do ChatGPT. Querem entender, não colar. Querem ser autônomos na prova.'
    }
  ],
  citacao: {
    texto:
      '"Sou vestibulanda e uso ChatGPT toda hora. Mas na hora da prova eu não lembro. Precisava de algo que me forçasse a pensar."',
    autor: '— Feedback de estudante durante teste de conceito'
  }
}

export const galeria = {
  tag: 'Galeria',
  titulo: 'Veja o LensLab ',
  tituloDestaque: 'em ação',
  lead:
    'O produto rodando. Da câmera inteligente ao material gerado, passando pela resolução guiada.',
  itens: [
    {
      id: 'camera',
      destaque: true,
      cabecalho: 'Câmera Inteligente',
      cabecalhoAccent: true,
      legenda: 'Sugestão adaptativa na câmera',
      tipo: 'deteccao',
      deteccao: { icone: '📚', titulo: 'Caderno detectado', subtitulo: 'Estudar com isso?' },
      botoes: [
        { label: 'Estuda Comigo', estilo: 'cheio' },
        { label: 'Só salvar', estilo: 'contorno' }
      ]
    },
    {
      id: 'estuda',
      cabecalho: 'Estuda Comigo',
      legenda: 'Material gerado automaticamente',
      tipo: 'lista',
      etiqueta: '📐 Matemática',
      subtitulo: '3 recursos prontos',
      itens: ['📄 Resumo', '🎴 8 Flashcards', '❓ Quiz de 4 questões']
    },
    {
      id: 'resolve',
      cabecalho: 'Resolve Aqui',
      legenda: 'Resolução guiada passo a passo',
      tipo: 'passo',
      passo: 'Passo 2 de 4',
      subtitulo: 'Escolha o método',
      pergunta: 'O que você faria neste passo?',
      botoes: [{ label: 'Pedir dica', estilo: 'pequeno' }]
    },
    {
      id: 'galeria',
      cabecalho: 'Galeria',
      legenda: 'Organização por matéria',
      tipo: 'materias',
      etiqueta: '🗂️ Suas matérias',
      materias: [
        { nome: '📐 Matemática', total: '12 itens' },
        { nome: '⚛️ Física', total: '8 itens' },
        { nome: '🧪 Química', total: '5 itens' }
      ]
    }
  ]
}

export const equipe = {
  tag: 'Nossa Equipe',
  titulo: 'As pessoas por trás do ',
  tituloDestaque: 'LensLab',
  lead:
    'Quatro estudantes de Engenharia de Software da FIAP construindo a câmera que gostariam de ter tido durante os próprios estudos.',
  membros: [
    {
      id: 'ms',
      iniciais: 'MS',
      nome: 'Marcelo Antônio Scoleso Junior',
      rm: 'RM 571626',
      papel: 'Front-End & Web Development',
      descricao:
        'Responsável pela camada visual do produto, do protótipo à experiência final do estudante.'
    },
    {
      id: 'jo',
      iniciais: 'JO',
      nome: 'João Paulo Francisco de Oliveira',
      rm: 'RM 571306',
      papel: 'Storytelling & Comunicação',
      descricao: 'Constrói a narrativa do LensLab e como ele se apresenta ao mercado.'
    },
    {
      id: 'jm',
      iniciais: 'JM',
      nome: 'Julia Souza Matarazzo',
      rm: 'RM 571340',
      papel: 'Total Experience Design',
      descricao:
        'Define o escopo, o backlog priorizado e a arquitetura da experiência do usuário.'
    },
    {
      id: 'gs',
      iniciais: 'GS',
      nome: 'Gabriel Souza Alexandre Silva',
      rm: 'RM 572607',
      papel: 'Lógica & Simulação',
      descricao:
        'Constrói o núcleo de decisão do LensLab em Python — o "cérebro" da câmera.'
    }
  ]
}

export const contato = {
  tag: 'Contato',
  titulo: 'Quer saber ',
  tituloDestaque: 'mais',
  tituloFim: '?',
  lead:
    'Deixe sua mensagem que a equipe LensLab retorna. Parcerias, dúvidas, feedback ou apenas curiosidade — todos são bem-vindos.',
  detalhes: [
    {
      id: 'instituicao',
      rotulo: 'Instituição',
      texto: 'FIAP — Faculdade de Informática e Administração Paulista'
    },
    { id: 'projeto', rotulo: 'Projeto', texto: 'Challenge JOVI Smartphone — 2026' },
    {
      id: 'email',
      rotulo: 'Email',
      texto: 'contato@lenslab.com.br',
      href: 'mailto:contato@lenslab.com.br'
    }
  ],
  redes: [
    { id: 'instagram', label: 'Instagram', href: '#contato' },
    { id: 'linkedin', label: 'LinkedIn', href: '#contato' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/MarceloScoleso/lenslabweb' }
  ],
  formulario: {
    titulo: 'Envie sua mensagem',
    assuntos: [
      { valor: 'parceria', label: 'Parceria comercial' },
      { valor: 'teste', label: 'Quero testar o app' },
      { valor: 'duvida', label: 'Dúvida geral' },
      { valor: 'feedback', label: 'Feedback' }
    ]
  }
}

/** Âncoras da landing, reaproveitadas pelo Header quando a rota é "/". */
export const ancoras = [
  { href: '#solucao', label: 'A Solução' },
  { href: '#publico', label: 'Público-Alvo' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#equipe', label: 'Equipe' },
  { href: '#contato', label: 'Contato' }
]
