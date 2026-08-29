# LensLab — Câmera Inteligente para Estudantes

> A câmera que ensina, não entrega.

Aplicação web em React desenvolvida para a **Sprint 3** da disciplina de **Web Development** (FIAP — Challenge JOVI Smartphone 2026).

O LensLab é uma câmera inteligente para estudantes que transforma fotos de material didático em resumo, flashcards e quiz automaticamente (**Modo Estuda Comigo**), ou conduz a resolução guiada passo a passo de um exercício sem entregar a resposta pronta (**Modo Resolve Aqui**).

Este projeto é a migração para React do protótipo HTML/CSS/JS entregue na Sprint 2, disponível em https://github.com/LensLabJovi/lenslab.

---

## Índice

- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como instalar as dependências](#como-instalar-as-dependências)
- [Como executar o projeto](#como-executar-o-projeto)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Estrutura de componentes (pai → filho)](#estrutura-de-componentes-pai--filho)
- [Migração a partir do protótipo da Sprint 2](#migração-a-partir-do-protótipo-da-sprint-2)
- [Uso de localStorage](#uso-de-localstorage)
- [Uso de Math](#uso-de-math)
- [Uso de IA no projeto](#uso-de-ia-no-projeto)
- [Deploy na Vercel](#deploy-na-vercel)
- [Integrantes](#integrantes)

---

## Tecnologias utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| **React** | 18.3.1 | Biblioteca principal de UI |
| **React Router DOM** | 6.26.2 | Roteamento entre páginas |
| **Vite** | 5.4.8 | Build tool e servidor de desenvolvimento |
| **CSS Modules** | nativo do Vite | Estilização com encapsulamento por componente |
| **localStorage API** | nativa do navegador | Persistência de dados entre sessões |
| **MediaDevices (getUserMedia)** | nativa do navegador | Acesso à webcam na tela de câmera |
| **Canvas API** | nativa do navegador | Captura, filtros dos modos, recorte e compressão da foto |
| **Web Audio API** | nativa do navegador | Som do obturador sintetizado na captura |

Não foram usadas bibliotecas de UI (Material, Tailwind, Bootstrap). Todo o design foi construído em CSS puro com CSS Modules, seguindo a identidade visual do produto LensLab.

---

## Como instalar as dependências

**Requisitos:**
- Node.js versão 18 ou superior (https://nodejs.org)
- npm (já vem junto com o Node)

**Passos:**

1. Extraia o conteúdo do arquivo `.zip` em uma pasta.
2. Abra o terminal na pasta extraída (a pasta que contém o `package.json`).
3. Execute:

```bash
npm install
```

O comando baixa todas as dependências listadas no `package.json`. Leva de 30 segundos a 2 minutos dependendo da conexão.

---

## Como executar o projeto

### Modo desenvolvimento (recomendado para testar)

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` e abre automaticamente no navegador.

### Modo produção (para testar o build final)

```bash
npm run build
npm run preview
```

O `build` gera os arquivos otimizados na pasta `dist/`. O `preview` sobe um servidor local servindo esses arquivos.

### Usuários e senhas

**Não há autenticação no projeto.** Não são necessários usuário nem senha para testar. A aplicação é de acesso livre e usa `localStorage` para guardar os dados no próprio navegador.

### Roteiro rápido de teste

O app abre vazio de propósito: tudo que aparece nas estatísticas vem das suas próprias ações. Para ver o produto com conteúdo imediatamente, use o atalho do passo 1.

1. **Atalho:** vá em **Galeria** e clique em **"Carregar dados de exemplo"**, à direita do contador de itens. Quatro itens são criados e as estatísticas passam a refletir esse uso. O botão fica sempre visível na aba Conteúdo e se desabilita depois que os exemplos são carregados, para não duplicá-los.
2. **Câmera:** vá em **Câmera** e autorize o acesso quando o navegador pedir. Experimente os modos (os chips e o botão **+** abrem os 14), o menu **Avançado** (brilho, saturação, contraste, proporção e temporizador) e a grade. Na barra inferior escolha o destino: em **Foto** você decide depois de capturar; em **Estuda Comigo** ou **Resolve Aqui** a captura já leva direto para aquele modo.
   - *Sem webcam?* Clique em **"Enviar imagem do dispositivo"** logo abaixo do visor. Todo o resto do fluxo funciona igual.
   - A permissão de câmera exige `http://localhost` ou `https://`. Abrir o `index.html` por duplo clique bloqueia a câmera.
3. **Estuda Comigo:** com a foto capturada, escolha a matéria, digite o conteúdo (mínimo 10 caracteres) e gere o material. Veja o resumo, navegue pelos flashcards e faça o quiz.
4. **Resolve Aqui:** repita com um exercício. Escolha também o **tempo por passo** (ou "Sem limite"), percorra os 4 passos acompanhando o cronômetro, peça dicas (máximo 3) e confirme o resultado.
5. **Galeria:** use a busca e os filtros. Mande um item para a lixeira, abra a aba **Lixeira** e restaure. Abra a aba **Histórico** para ver o registro das ações.
6. **Persistência:** recarregue a página (F5). Tudo continua lá, porque está no localStorage.

---

## Estrutura de pastas

```
lenslab/
├── public/
│   ├── favicon.png             # Gerado a partir do logo do protótipo
│   ├── apple-touch-icon.png
│   └── assets/                 # Imagens herdadas do protótipo da Sprint 2
│       ├── lenslab.webp        # Logo (header e footer)
│       └── slides/             # Imagens dos dados de exemplo (fotos do
│                               # protótipo + 3 peças desenhadas para o seed)
├── src/
│   ├── components/             # Componentes reutilizáveis
│   │   ├── Layout/             # Componente pai que envolve tudo
│   │   ├── Header/             # Cabeçalho fixo com navegação
│   │   ├── Footer/             # Rodapé
│   │   ├── StatCard/           # Card de estatística reutilizável
│   │   └── Icon/               # Ícones SVG usados em toda a interface
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Home/               # Dashboard inicial
│   │   ├── Camera/             # Câmera completa, portada do protótipo
│   │   │   ├── Camera.jsx      # Visor, controles e barra de destino
│   │   │   └── FolhasCamera.jsx# Folhas de modos e de controles avançados
│   │   ├── Galeria/            # Central de conteúdo
│   │   ├── EstudaComigo/       # Modo: material de estudo
│   │   ├── ResolveAqui/        # Modo: resolução guiada
│   │   └── Sobre/              # Sobre o projeto e a equipe
│   ├── hooks/
│   │   ├── useLocalStorage.js  # Hook de persistência
│   │   ├── useCamera.js        # Hook do getUserMedia + captura
│   │   └── useHistorico.js     # Hook do registro de ações
│   ├── services/
│   │   ├── photos.js           # Armazenamento das capturas
│   │   └── seed.js             # Dados de exemplo
│   ├── utils/
│   │   ├── math-utils.js       # Funções com Math
│   │   ├── captura-efeitos.js  # Som de obturador e vibração
│   │   ├── modos-camera.js     # Os 14 modos e seus filtros CSS
│   │   ├── storage.js          # Detecta localStorage bloqueado
│   │   └── ia-mock.js          # Simulação das respostas de IA
│   ├── styles/
│   │   └── global.css          # Variáveis CSS e estilos globais
│   ├── App.jsx                 # Definição das rotas
│   └── main.jsx                # Entry point React
├── index.html
├── package.json
├── vite.config.js
├── vercel.json                 # Rewrite para as rotas do React Router
├── README.md
└── INTEGRANTES.TXT
```

---

## Estrutura de componentes (pai → filho)

```
Layout (pai)
  ├── Header (filho)
  ├── AvisoArmazenamento (filho, só quando o localStorage está bloqueado)
  ├── main → Outlet (renderiza a página atual)
  │   ├── Home
  │   │   └── StatCard × 4 (filhos)
  │   ├── Camera
  │   │   ├── Visor (filho)
  │   │   ├── ControlesTopo (filho)
  │   │   ├── BarraCaptura (filho)
  │   │   ├── EscolhaDestino (filho)
  │   │   ├── FolhaModos (filho)
  │   │   └── FolhaAvancado (filho)
  │   ├── Galeria
  │   │   ├── StatCard × 4 (filhos)
  │   │   ├── ItemCard × N (filhos)
  │   │   ├── ItemLixeira × N (filhos)
  │   │   └── ListaHistorico (filho)
  │   ├── EstudaComigo
  │   │   ├── FormularioCaptura (filho)
  │   │   ├── TelaProcessando (filho)
  │   │   ├── MaterialGerado (filho)
  │   │   ├── QuizPlayer (filho)
  │   │   └── ResultadoQuiz (filho)
  │   ├── ResolveAqui
  │   │   ├── FormularioExercicio (filho)
  │   │   ├── TelaProcessando (filho)
  │   │   ├── PassoAtual (filho)
  │   │   └── ResultadoFinal (filho)
  │   └── Sobre
  │       └── MembroCard × 4 (filhos)
  └── Footer (filho)
```

Todos são **componentes funcionais**, e a comunicação acontece por **props do pai para o filho** (dados) e **callbacks do filho para o pai** (eventos), como em `StatCard`, `ItemCard`, `QuizPlayer` e `PassoAtual`.

---

## Uso de localStorage

O hook customizado `useLocalStorage` (em `src/hooks/useLocalStorage.js`) encapsula toda a lógica de persistência: lê o valor salvo na inicialização e grava a cada alteração, com tratamento de erro.

Chaves utilizadas:

| Chave | Conteúdo |
|---|---|
| `lenslab_notas` | Materiais de estudo gerados no Estuda Comigo |
| `lenslab_exercicios` | Exercícios resolvidos no Resolve Aqui |
| `lenslab_lixeira` | Itens removidos, ainda recuperáveis |
| `lenslab_historico` | Últimos 50 eventos (criado, removido, restaurado, excluído) |
| `lenslab:photos` | Fotos capturadas, mesma chave e mesmo formato do protótipo da Sprint 2 |

Os dados persistem entre sessões: ao recarregar a página, a Home e a Galeria recuperam tudo automaticamente.

Detalhe de implementação: a gravação acontece de forma síncrona dentro do setter do hook, e não em um `useEffect`. Isso é necessário porque, quando o usuário salva um material e navega para a Galeria no mesmo evento, o componente é desmontado antes de um efeito conseguir rodar, e o dado se perderia.

Sobre as fotos: o localStorage tem cerca de 5 MB, então cada captura é reduzida para no máximo 720px e reencodada em JPEG (algo entre 40 e 80 KB), a lista guarda as 30 capturas mais recentes, e a foto é apagada junto com o item na exclusão definitiva da Galeria. Se ainda assim a cota estourar, a tela de câmera mostra a mensagem de erro em vez de falhar em silêncio.

---

## Uso de Math

O arquivo `src/utils/math-utils.js` reúne as funções que utilizam o objeto `Math` nativo:

| Função | Métodos de Math usados | Onde é usada |
|---|---|---|
| `gerarId()` | `Math.random`, `Math.floor` | IDs únicos de notas, exercícios, flashcards e quiz |
| `arredondar()` | `Math.round`, `Math.pow` | Tempo de processamento e médias |
| `calcularPercentual()` | `Math.round` | Taxa de acerto do quiz e dos exercícios |
| `sortear()` / `sortearVarios()` | `Math.random`, `Math.floor`, `Math.min` | Sorteio de tópicos, flashcards e perguntas |
| `formatarTamanho()` | `Math.log`, `Math.pow`, `Math.floor` | Peso da imagem no detalhe do card da Galeria |
| `formatarDuracao()` | `Math.floor`, `Math.max` | Cronômetro por passo do Resolve Aqui |
| `tempoRelativo()` | `Math.floor` | "há 5 minutos" nos cards da Galeria |
| `calcularEstatisticas()` | `Math.max`, `Math.min` | Média, máximo e mínimo do tempo de estudo |
| `tempoAleatorio()` | `Math.random`, `Math.floor` | Simulação da latência de processamento |

---

## Uso de IA no projeto

A IA foi utilizada em duas frentes distintas neste projeto.

**Como assistente de desenvolvimento:** usamos ferramentas de IA para acelerar a estruturação inicial dos componentes React (Layout, Header, Footer), gerar bases de CSS, apoiar o levantamento do que deveria ser migrado do protótipo da Sprint 2 e revisar trechos de código em busca de erros. Duas correções relevantes vieram dessa revisão: a perda de dados do localStorage quando o componente era desmontado no mesmo evento do salvamento, e o encerramento do stream da webcam ao trocar de rota, que no protótipo dependia do evento `beforeunload` e não funcionaria em uma SPA. Todas as decisões de arquitetura, o recorte do escopo, quais telas migrar e a estrutura pai → filho foram tomadas pela equipe. A IA acelerou a implementação, não substituiu o desenho da solução.

**Como conceito simulado dentro do produto:** o LensLab é, por natureza, um produto que dependeria de IA em produção (OCR para ler o texto das fotos, modelos de geração de texto para produzir resumos, flashcards e quizzes, e lógica pedagógica para conduzir a resolução guiada). Como o escopo acadêmico não inclui integrar modelos reais, o arquivo `src/utils/ia-mock.js` simula essas respostas com templates por matéria. Em produção, essa camada seria substituída por chamadas a APIs de IA reais, sem alterar o restante da aplicação.

---

## Migração a partir do protótipo da Sprint 2

O protótipo da Sprint 2 tem cerca de 14 mil linhas de HTML, CSS e JavaScript puro. A migração foi seletiva, e não uma conversão literal, por duas razões: boa parte daquele código pertence ao conceito anterior do produto (a câmera que reconhece a cena), substituído pelo conceito atual focado no estudante; e o padrão do JavaScript vanilla, baseado em `querySelectorAll` e manipulação direta do DOM, produziria React de má qualidade se traduzido linha a linha.

**O que foi migrado:**

| Item | Origem no protótipo | Destino |
|---|---|---|
| Tokens de cor, tipografia, raios e sombras | `css/variables.css` | `src/styles/global.css` |
| Tipografia DM Sans e JetBrains Mono | `css/global.css` | `index.html` |
| Moldura do celular, visor e botão de captura | `css/camera.css` | `src/pages/Camera/Camera.module.css` |
| `getUserMedia`, constraints e tratamento de erros | `js/camera.js` | `src/hooks/useCamera.js` |
| Captura via canvas e espelhamento da câmera frontal | `js/camera.js` | `src/hooks/useCamera.js` |
| Os 14 modos de captura e seus filtros CSS | `js/camera.js` | `src/utils/modos-camera.js` |
| Ajustes de brilho, saturação e contraste | `js/camera.js` | `src/pages/Camera/FolhasCamera.jsx` |
| Proporção com recorte no canvas e temporizador | `js/camera.js` | `useCamera.js` + `Camera.jsx` |
| Som de obturador (Web Audio) e vibração | `js/camera.js` | `src/utils/captura-efeitos.js` |
| Folhas deslizantes (bottom sheets) | `css/camera.css` | `src/pages/Camera/FolhasCamera.jsx` |
| Armazenamento e compressão das fotos | `js/photos.js` | `src/services/photos.js` |
| Logo, favicon e 5 imagens | `assets/galeria/` | `public/assets/` |

**O que foi adaptado na migração:**

- O objeto `estado` mutável e os blocos de `addEventListener` viraram estado do React.
- A grade 3×3, criada via `createElement` no protótipo, virou renderização condicional.
- O encerramento do stream da webcam saiu de `beforeunload` para o cleanup do `useEffect`, porque em uma SPA o usuário troca de rota sem descarregar a página e a webcam ficaria ligada.
- As imagens foram convertidas de PNG para WebP. O `retrato.png` tinha 13 MB em 3000×3751; agora tem 161 KB em 1200×1500. O conjunto saiu de 14,5 MB para 320 KB.
- O roxo `#6C5CE7` do protótipo foi substituído pelo verde `#00C896` da identidade atual do LensLab, que é a cor usada na landing page, no material da banca e nos documentos da Sprint 3. Estrutura, tipografia e superfícies continuam vindo do protótipo.

**Sobre os modos de câmera:** os modos genéricos (Documento, Retrato, Noturno, Caderno, Lousa, QR Code, Macro, Panorama, Comida, HDR, Selfie+ e os dois de vídeo) foram trazidos de volta na Sprint 3. Eles não são a proposta do produto — são o que qualquer câmera tem — e servem justamente para que os dois modos exclusivos do LensLab apareçam onde fazem sentido: dentro de uma câmera completa. Cada modo aplica um filtro CSS no visor, e o mesmo filtro é gravado na foto pelo `ctx.filter` do canvas de captura.

**O que ficou de fora, por pertencer ao conceito anterior:** os chips de sugestão adaptativa (a câmera que "aprende a rotina"), o modo silencioso automático noturno e o badge de "modo sugerido" — esses três eram a tese do conceito reprovado, a câmera que entende a cena. Também ficaram de fora as telas de login e cadastro, já que o projeto não tem autenticação.

---

## Deploy na Vercel

**Link do deploy:**

**Link do repositório GitHub:** https://github.com/MarceloScoleso/lenslabweb

### Como fazer o deploy

O projeto usa Vite, que tem suporte nativo na Vercel.

1. Faça o push do projeto para um repositório no GitHub.
2. Acesse vercel.com e entre com a conta do GitHub.
3. Clique em **Add New Project** e selecione o repositório do LensLab.
4. A Vercel detecta o Vite automaticamente. Confirme:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Clique em **Deploy**.

O arquivo `vercel.json` já está incluído com o rewrite necessário para o React Router. Sem ele, acessar `/galeria` diretamente ou recarregar a página em uma rota interna retornaria erro 404.

---

## Integrantes

| Nome | RM |
|---|---|
| Marcelo Antônio Scoleso Junior | 571626 |
| João Paulo Francisco de Oliveira | 571306 |
| Julia Souza Matarazzo | 571340 |
| Gabriel Souza Alexandre Silva | 572607 |

---

Projeto acadêmico desenvolvido para a FIAP em parceria com a JOVI Smartphone. Uso educacional.

**LensLab — A câmera que ensina.**
