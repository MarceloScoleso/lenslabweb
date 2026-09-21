# LensLab — Câmera Inteligente para Estudantes

> A câmera que ensina, não entrega.

Aplicação web em React desenvolvida para a **Sprint 4**, entrega **conjunta** das disciplinas de **Front-End Design** e **Web Development** (FIAP — Challenge JOVI Smartphone 2026).

O LensLab é uma câmera inteligente para estudantes que transforma fotos de material didático em resumo, flashcards e quiz automaticamente (**Modo Estuda Comigo**), conduz a resolução guiada passo a passo de um exercício sem entregar a resposta pronta (**Modo Resolve Aqui**) e, a partir desta Sprint, desfoca os rostos de uma foto um a um antes de compartilhar (**Modo Privacidade Estudante**).

Esta Sprint é a **evolução direta da Sprint 3**, não um projeto novo. O que mudou:

- a **landing page** que foi a entrega de Front-End Design na Sprint 3 deixou de ser um site HTML separado e passou a ser a rota `/` da própria aplicação React, quebrada em componentes que recebem o conteúdo por props;
- a estilização inteira migrou de CSS Modules para **Tailwind CSS**, sem perder os tokens de cor, tipografia e sombra do produto;
- o app ganhou **API própria** em funções serverless, **login** com rotas públicas e privadas, e o **Modo Privacidade Estudante**.

A Sprint 3 (React + localStorage) foi por sua vez a migração do protótipo HTML/CSS/JS da Sprint 2, disponível em https://github.com/LensLabJovi/lenslab.

---

## Índice

- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Como instalar as dependências](#como-instalar-as-dependências)
- [Como executar o projeto](#como-executar-o-projeto)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Estrutura de componentes (pai → filho)](#estrutura-de-componentes-pai--filho)
- [Landing page da Sprint 3 integrada ao React](#landing-page-da-sprint-3-integrada-ao-react)
- [Responsividade](#responsividade)
- [Migração a partir do protótipo da Sprint 2](#migração-a-partir-do-protótipo-da-sprint-2)
- [Uso de localStorage](#uso-de-localstorage)
- [Uso de Math](#uso-de-math)
- [API própria](#api-própria)
- [Rotas públicas e privadas](#rotas-públicas-e-privadas)
- [Hooks customizados](#hooks-customizados)
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
| **Tailwind CSS** | 4.3.3 | Estilização de **toda** a interface, integrada aos tokens de cor do projeto |
| **@tailwindcss/vite** | 4.3.3 | Plugin que integra o Tailwind ao build do Vite |
| **Funções serverless da Vercel** | Node.js | API própria do projeto (pasta `api/`) |
| **MediaPipe Tasks Vision** | 1.0.1 | Detecção de rostos no Modo Privacidade Estudante |
| **localStorage API** | nativa do navegador | Persistência de dados entre sessões |
| **MediaDevices (getUserMedia)** | nativa do navegador | Acesso à webcam na tela de câmera |
| **Canvas API** | nativa do navegador | Captura, filtros dos modos, recorte e compressão da foto |
| **Web Audio API** | nativa do navegador | Som do obturador sintetizado na captura |

A estilização usa **Tailwind CSS** do começo ao fim: não há nenhum arquivo `.module.css` no projeto. As cores, fontes, raios e sombras do LensLab são definidos uma única vez em `src/styles/global.css` (que hoje contém apenas os tokens em `:root`, o reset e a regra de `prefers-reduced-motion`) e expostos ao Tailwind pelo bloco `@theme` de `src/styles/tailwind.css`, então classes como `bg-surface`, `text-accent` e `border-line` usam exatamente a identidade visual do produto.

O que o Tailwind não tem pronto fica declarado no próprio `src/styles/tailwind.css`, pelas APIs do Tailwind v4: as animações como `@keyframes` expostas por `@theme` (`animate-flutuar`, `animate-boiar`, `animate-subir-folha`) e os fundos de várias camadas como `@utility` (`fundo-camera`, `fundo-painel`, `slider-camera`). As sequências de utilitários que se repetem — container e botões — ficam em `src/styles/classes.js`. Não foram usadas bibliotecas de componentes prontos (Material, Bootstrap, shadcn).

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

A aplicação tem autenticação. As páginas públicas (início, sobre e login) abrem sem conta; todo o resto exige login.

| Perfil | E-mail | Senha |
|---|---|---|
| Estudante | `estudante@lenslab.com` | `lenslab123` |
| Avaliador | `professor@lenslab.com` | `fiap2026` |

Na tela de login há um botão **"Preencher automaticamente"** que completa os dados do usuário de teste.

### Servidor da API (back-end)

O projeto tem uma API própria, na pasta `api/`, mas **não é preciso subir nenhum servidor separado**:

- **Em desenvolvimento**, o `npm run dev` já serve a API junto com o front, pelo plugin `dev/api-local.js`. As rotas respondem em `http://localhost:3000/api/...`.
- **Em produção**, a Vercel transforma cada arquivo de `api/` em uma função serverless automaticamente no deploy.

O mesmo código roda nos dois ambientes. Para testar a API isoladamente, com o `npm run dev` rodando:

```bash
curl http://localhost:3000/api/materias
```

Opcionalmente, defina a variável de ambiente `LENSLAB_SECRET` (usada para assinar os tokens de sessão). Sem ela, é usado um valor padrão, suficiente para avaliação.

### Roteiro rápido de teste

O app abre vazio de propósito: tudo que aparece nas estatísticas vem das suas próprias ações. Para ver o produto com conteúdo imediatamente, use o atalho do passo 3.

1. **Landing:** a aplicação abre em `/` com a landing page, sem pedir login. Percorra as seções pelo menu (A Solução, Público-Alvo, Galeria, Equipe, Contato) e envie o formulário de contato para ver a validação e a confirmação.
2. **Login:** clique em **Entrar** (ou em **Começar agora**, no topo da landing). Use o botão **"Preencher automaticamente"**, que completa e-mail e senha do usuário de teste, e envie. Para conferir o tratamento de erro da API, troque a senha por qualquer coisa antes de enviar: a mensagem vem do back-end.
   - Tente também abrir `/galeria` **antes** de entrar: o app redireciona para o login e, depois de autenticar, devolve você para a Galeria.
3. **Atalho de conteúdo:** vá em **Galeria** e clique em **"Carregar dados de exemplo"**, à direita do contador de itens. Quatro itens são criados e as estatísticas passam a refletir esse uso. O botão fica sempre visível na aba Conteúdo e se desabilita depois que os exemplos são carregados, para não duplicá-los.
4. **Câmera:** vá em **Câmera** e autorize o acesso quando o navegador pedir. Experimente os modos (os chips e o botão **+** abrem os 14), o menu **Avançado** (brilho, saturação, contraste, proporção e temporizador) e a grade. Na barra inferior escolha o destino: em **Foto** você decide depois de capturar; em **Estuda Comigo** ou **Resolve Aqui** a captura já leva direto para aquele modo.
   - *Sem webcam?* Clique em **"Enviar imagem do dispositivo"** logo abaixo do visor. Todo o resto do fluxo funciona igual.
   - A permissão de câmera exige `http://localhost` ou `https://`. Abrir o `index.html` por duplo clique bloqueia a câmera.
5. **Estuda Comigo:** com a foto capturada, escolha a matéria, digite o conteúdo (mínimo 10 caracteres) e gere o material. Veja o resumo, navegue pelos flashcards e faça o quiz.
6. **Resolve Aqui:** repita com um exercício. Escolha também o **tempo por passo** (ou "Sem limite"), percorra os 4 passos acompanhando o cronômetro, peça dicas (máximo 3) e confirme o resultado.
7. **Modo Privacidade Estudante:** capture uma foto **com rostos** e, na escolha de destino, clique em **"Proteger rostos"** — a foto abre já carregada no modo. (Pela barra lateral também dá: **Privacidade** → envie uma imagem do computador.) Os rostos encontrados começam todos desfocados; clique em **Mostrar** para revelar um por um, ajuste a **intensidade do desfoque** e, se algum rosto escapar da detecção, toque na imagem para marcá-lo à mão. Termine em **Salvar na galeria** ou **Baixar imagem**.
   - A detecção roda no próprio navegador (MediaPipe/BlazeFace): a foto não é enviada para lugar nenhum. Na primeira vez o modelo é baixado, o que leva alguns segundos.
8. **Galeria:** use a busca e os filtros — inclusive o novo **"Só fotos protegidas"**. Mande um item para a lixeira, abra a aba **Lixeira** e restaure. Abra a aba **Histórico** para ver o registro das ações.
9. **Sair e persistência:** recarregue a página (F5): tudo continua lá, porque está no localStorage. Clique em **Sair** e confirme que o app volta para a landing e que as rotas privadas voltam a pedir login.

---

## Estrutura de pastas

```
lenslab/
├── api/                        # API própria (funções serverless da Vercel)
│   ├── _lib/
│   │   ├── auth.js             # Assinatura e validação do token HMAC-SHA256
│   │   ├── geracao.js          # Geração de resumo, quiz e passos guiados
│   │   └── http.js             # Helpers de resposta JSON e de método
│   ├── auth/
│   │   ├── login.js            # POST /api/auth/login
│   │   └── me.js               # GET  /api/auth/me
│   ├── materias.js             # GET  /api/materias
│   ├── estudar.js              # POST /api/estudar
│   └── resolver.js             # POST /api/resolver
├── dev/
│   └── api-local.js            # Plugin do Vite que serve /api no npm run dev
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
│   │   ├── Header/             # Cabeçalho fixo; vira âncoras na landing
│   │   ├── Footer/             # Rodapé
│   │   ├── StatCard/           # Card de estatística reutilizável
│   │   ├── RotaPrivada/        # Guarda das rotas que exigem login
│   │   ├── Icon/               # Ícones SVG usados em toda a interface
│   │   └── landing/            # Seções da landing page da Sprint 3
│   │       ├── Hero.jsx        # #top
│   │       ├── Solucao.jsx     # #solucao
│   │       ├── Publico.jsx     # #publico
│   │       ├── GaleriaDemo.jsx # #galeria
│   │       ├── Equipe.jsx      # #equipe
│   │       ├── Contato.jsx     # #contato
│   │       └── CabecalhoSecao.jsx # Cabeçalho compartilhado das seções
│   ├── pages/                  # Páginas da aplicação
│   │   ├── Landing/            # Rota "/" — a landing da Sprint 3 em React
│   │   ├── Login/              # Entrada no app
│   │   ├── Home/               # Painel do estudante
│   │   ├── Camera/             # Câmera completa, portada do protótipo
│   │   │   ├── Camera.jsx      # Visor, controles e barra de destino
│   │   │   └── FolhasCamera.jsx# Folhas de modos e de controles avançados
│   │   ├── Galeria/            # Central de conteúdo
│   │   ├── EstudaComigo/       # Modo: material de estudo
│   │   ├── ResolveAqui/        # Modo: resolução guiada
│   │   ├── Privacidade/        # Modo Privacidade Estudante
│   │   ├── Sobre/              # Sobre o projeto e a equipe
│   │   └── NaoEncontrada/      # Página 404
│   ├── contexts/
│   │   └── AuthContext.jsx     # Provedor da sessão do usuário
│   ├── data/
│   │   └── landing.js          # Todo o conteúdo da landing, em forma de dados
│   ├── hooks/
│   │   ├── useAuth.js          # Leitura do contexto de sessão
│   │   ├── useLogin.js         # Formulário e envio do login
│   │   ├── useMaterias.js      # Matérias vindas da API
│   │   ├── useEstudaComigo.js  # Fluxo inteiro do Estuda Comigo
│   │   ├── useResolveAqui.js   # Fluxo inteiro do Resolve Aqui
│   │   ├── usePrivacidade.js   # Detecção e desfoque de rostos
│   │   ├── useRolagem.js       # Sombra do header ao rolar (landing)
│   │   ├── useFormularioContato.js # Validação e envio do form de contato
│   │   ├── useLocalStorage.js  # Hook de persistência
│   │   ├── useCamera.js        # Hook do getUserMedia + captura
│   │   └── useHistorico.js     # Hook do registro de ações
│   ├── services/
│   │   ├── api.js              # Cliente HTTP: token, timeout e erros
│   │   ├── photos.js           # Armazenamento das capturas
│   │   └── seed.js             # Dados de exemplo
│   ├── utils/
│   │   ├── math-utils.js       # Funções com Math
│   │   ├── captura-efeitos.js  # Som de obturador e vibração
│   │   ├── modos-camera.js     # Os 14 modos e seus filtros CSS
│   │   ├── rostos.js           # Detecção de rostos e desfoque em canvas
│   │   ├── storage.js          # Detecta localStorage bloqueado
│   │   └── ia-mock.js          # Simulação das respostas de IA
│   ├── styles/
│   │   ├── tailwind.css        # Entrada do Tailwind, @theme e @utility
│   │   ├── global.css          # Só tokens (:root), reset e reduced-motion
│   │   └── classes.js          # Container e botões como utilitários do Tailwind
│   ├── App.jsx                 # Definição das rotas públicas e privadas
│   └── main.jsx                # Entry point React
├── index.html
├── package.json
├── vite.config.js              # React + Tailwind + API local
├── vercel.json                 # Rewrite das rotas, preservando /api
├── README.md
└── INTEGRANTES.TXT
```

Não existe nenhum arquivo `.module.css`: toda a estilização passou para o Tailwind nesta Sprint.

---

## Estrutura de componentes (pai → filho)

```
AuthProvider (contexto da sessão, envolve tudo)
└── Layout (pai)
  ├── Header (filho)
  ├── AvisoArmazenamento (filho, só quando o localStorage está bloqueado)
  ├── main → Outlet (renderiza a página atual)
  │   ├── Landing  (rota pública "/")
  │   │   ├── Hero (filho)
  │   │   │   ├── Estatistica × 3 (netos)
  │   │   │   └── MockupCelular (neto)
  │   │   ├── Solucao (filho)
  │   │   │   ├── CabecalhoSecao (neto)
  │   │   │   ├── CartaoComparacao × 2 (netos)
  │   │   │   └── CartaoModo × 3 (netos)
  │   │   ├── Publico (filho)
  │   │   │   ├── CabecalhoSecao (neto)
  │   │   │   └── CartaoPersona × 4 (netos)
  │   │   ├── GaleriaDemo (filho)
  │   │   │   ├── CabecalhoSecao (neto)
  │   │   │   └── MockupTela × 4 (netos) → ConteudoTela (bisnetos)
  │   │   ├── Equipe (filho)
  │   │   │   ├── CabecalhoSecao (neto)
  │   │   │   └── CartaoMembro × 4 (netos)
  │   │   └── Contato (filho)
  │   │       ├── CabecalhoSecao (neto)
  │   │       └── CampoFormulario × 4 (netos)
  │   ├── Login  (rota pública)
  │   │   └── CampoTexto × 2 (filhos)
  │   ├── RotaPrivada (guarda: sem sessão, redireciona para /login)
  │   │   └── Outlet → as páginas privadas abaixo
  │   ├── Home (Painel)
  │   │   ├── CabecalhoSecao × 2 (filhos)
  │   │   ├── StatCard × 4 (filhos)
  │   │   └── CartaoAtalho × 5 (filhos)
  │   ├── Camera
  │   │   ├── Visor (filho)
  │   │   ├── ControlesTopo (filho)
  │   │   ├── BarraCaptura (filho)
  │   │   ├── EscolhaDestino (filho)
  │   │   │   └── BotaoDestino × 3 (netos: Estuda, Resolve, Proteger rostos)
  │   │   ├── FolhaModos (filho) → ItemModo × 15 (netos)
  │   │   └── FolhaAvancado (filho) → BotaoSegmento × N (netos)
  │   ├── Galeria
  │   │   ├── StatCard × 4 (filhos)
  │   │   ├── ItemCard × N (filhos)
  │   │   ├── ItemLixeira × N (filhos)
  │   │   ├── ListaHistorico (filho)
  │   │   └── Vazio (filho, quando não há o que listar)
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
  │   ├── Privacidade
  │   │   ├── EscolherFoto (filho)
  │   │   ├── Editor (filho)
  │   │   │   └── CaixaRosto × N (netos)
  │   │   └── PainelRostos (filho)
  │   │       └── ItemRosto × N (netos)
  │   ├── Sobre
  │   │   ├── CabecalhoSecao × 2 (filhos)
  │   │   └── MembroCard × 4 (filhos)
  │   └── NaoEncontrada (rota "*")
  └── Footer (filho)
```

Todos são **componentes funcionais**, e a comunicação acontece por **props do pai para o filho** (dados) e **callbacks do filho para o pai** (eventos), como em `StatCard`, `ItemCard`, `QuizPlayer` e `PassoAtual`.

A landing é o exemplo mais direto disso: ela não tem texto nenhum dentro do JSX. Todo o conteúdo — títulos, listas, personas, integrantes, opções do formulário — mora em `src/data/landing.js` e desce por props para as seções, que são componentes puros de apresentação.

---

## Landing page da Sprint 3 integrada ao React

A landing entregue em Front-End Design na Sprint 3 era um site estático (HTML, CSS e JS puros). Nesta Sprint ela virou a rota pública `/` da aplicação, com as mesmas seções, os mesmos textos, a mesma ordem e as mesmas âncoras (`#solucao`, `#publico`, `#galeria`, `#equipe`, `#contato`).

O que mudou na tradução para React:

| Na Sprint 3 | Na Sprint 4 |
|---|---|
| `index.html` com as seções escritas à mão | `src/pages/Landing/Landing.jsx` + seis componentes em `src/components/landing/` |
| Textos dentro do HTML | `src/data/landing.js`, entregue às seções por **props** |
| `css/style.css` + `css/responsive.css` | Classes do Tailwind, com os breakpoints equivalentes |
| Menu mobile em `js/main.js` | O mesmo `Header` do app, que troca para as âncoras quando a rota é `/` e não há sessão |
| Sombra do header no scroll, via `style.boxShadow` | Hook `useRolagem()` |
| `scrollTo` calculando o offset do header | `scroll-behavior: smooth` + `scroll-mt` nas seções |
| Envio do formulário com `setTimeout` no DOM | Hook `useFormularioContato()`, com validação por campo e estado de envio |

O header e o rodapé da landing não são duplicados: são o `Header` e o `Footer` do `Layout`, compartilhados com o resto do app. O CTA principal do hero leva para `/login`, ou direto para `/painel` quando já existe sessão.

Uma mudança de conteúdo foi feita de propósito: o card do **Privacidade Estudante**, que na Sprint 3 dizia "Em breve", agora diz "Disponível", porque o modo foi implementado nesta Sprint.

---

## Responsividade

Os breakpoints originais da landing (1199px, 991px, 767px e 480px) foram traduzidos para os do Tailwind, e o app inteiro foi conferido em **390px (celular)**, **768px (tablet)** e **1366px (desktop)**.

| Faixa | Comportamento |
|---|---|
| até 640px | Uma coluna em tudo; botões ocupam a largura toda; a câmera fica embaixo do texto de apoio |
| 641–860px | Grades de 2 colunas; a navegação ainda é a gaveta lateral |
| a partir de 861px | A navegação vira barra horizontal (breakpoint `nav`, declarado em `tailwind.css`) |
| a partir de 1024px | Layouts de 3 e 4 colunas: modos, personas, equipe e a galeria da landing |

Nenhuma tela tem rolagem horizontal: em todas as rotas, `scrollWidth` é igual a `clientWidth` a 390px.

---

## Uso de localStorage

O hook customizado `useLocalStorage` (em `src/hooks/useLocalStorage.js`) encapsula toda a lógica de persistência: lê o valor salvo na inicialização e grava a cada alteração, com tratamento de erro.

Chaves utilizadas:

| Chave | Conteúdo |
|---|---|
| `lenslab_notas` | Materiais de estudo gerados no Estuda Comigo |
| `lenslab_exercicios` | Exercícios resolvidos no Resolve Aqui |
| `lenslab_protegidas` | Fotos do Modo Privacidade salvas na galeria, com a contagem de rostos desfocados |
| `lenslab_lixeira` | Itens removidos, ainda recuperáveis |
| `lenslab_sessao` | Token e usuário da sessão, revalidados na API ao abrir o app |
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

## API própria

A API é composta por funções serverless da Vercel, na pasta `api/`. Todas respondem JSON.

| Método | Rota | Acesso | O que faz |
|---|---|---|---|
| `POST` | `/api/auth/login` | Pública | Recebe `{ email, senha }` e devolve `{ token, usuario }` |
| `GET` | `/api/auth/me` | Privada | Valida o token e devolve o usuário da sessão |
| `GET` | `/api/materias` | Pública | Lista as matérias e em quais modos cada uma está disponível |
| `POST` | `/api/estudar` | Privada | Recebe `{ materia, conteudo }` e devolve resumo, flashcards e quiz |
| `POST` | `/api/resolver` | Privada | Recebe `{ materia, enunciado }` e devolve os passos guiados |

As rotas privadas exigem o cabeçalho `Authorization: Bearer <token>`. O token é assinado com HMAC-SHA256 e expira em 8 horas. Por coerência com o princípio do Resolve Aqui, a rota `/api/resolver` nunca devolve a resposta final do exercício, apenas os passos e as dicas.

No front, todas as chamadas passam por `src/services/api.js`, que anexa o token, aplica timeout de 15 segundos e transforma erros HTTP em mensagens legíveis. Se a API responder 401 no meio do uso, a sessão é encerrada e o usuário volta para o login.

---

## Rotas públicas e privadas

| Rota | Acesso | Página |
|---|---|---|
| `/` | Pública | Landing page |
| `/login` | Pública | Login |
| `/sobre` | Pública | Sobre o projeto e a equipe |
| `/painel` | Privada | Painel com as estatísticas do estudante |
| `/camera` | Privada | Câmera |
| `/estuda-comigo` | Privada | Modo Estuda Comigo |
| `/resolve-aqui` | Privada | Modo Resolve Aqui |
| `/privacidade` | Privada | Modo Privacidade Estudante |
| `/galeria` | Privada | Galeria, lixeira e histórico |
| `*` | Pública | Página 404 |

As rotas privadas ficam dentro do componente `RotaPrivada`, que redireciona para `/login` quando não há sessão e guarda a rota de origem: depois de entrar, o usuário volta exatamente para onde estava. Ao abrir o app, uma sessão salva no navegador é revalidada na API antes de liberar o acesso.

---

## Hooks customizados

A lógica foi separada das telas. As páginas apenas desenham o que os hooks devolvem.

| Hook | Responsabilidade |
|---|---|
| `useAuth` | Estado da sessão: usuário, login e logout |
| `useLogin` | Validação e envio do formulário de login |
| `useMaterias` | Busca das matérias na API, com lista reserva se a API cair |
| `useEstudaComigo` | Fluxo completo do Estuda Comigo: geração pela API, quiz e salvamento |
| `useResolveAqui` | Fluxo completo do Resolve Aqui: passos pela API, dicas e resultado |
| `usePrivacidade` | Detecção de rostos, decisão rosto a rosto, exportação e abertura automática da foto vinda da câmera |
| `useRolagem` | Sombra do header ao rolar — substitui o trecho de scroll do `js/main.js` da landing |
| `useFormularioContato` | Campos, validação e estado de envio do formulário de contato da landing |
| `useCamera` | Acesso à webcam via getUserMedia e captura |
| `useLocalStorage` | Estado persistido no navegador |
| `useHistorico` | Registro das ações na galeria |

---

## Uso de IA no projeto

A IA foi utilizada em duas frentes distintas neste projeto.

**Como assistente de desenvolvimento:** usamos ferramentas de IA para acelerar a estruturação inicial dos componentes React (Layout, Header, Footer), gerar bases de CSS, apoiar o levantamento do que deveria ser migrado do protótipo da Sprint 2 e revisar trechos de código em busca de erros. Duas correções relevantes vieram dessa revisão: a perda de dados do localStorage quando o componente era desmontado no mesmo evento do salvamento, e o encerramento do stream da webcam ao trocar de rota, que no protótipo dependia do evento `beforeunload` e não funcionaria em uma SPA. Todas as decisões de arquitetura, o recorte do escopo, quais telas migrar e a estrutura pai → filho foram tomadas pela equipe. A IA acelerou a implementação, não substituiu o desenho da solução.

**Como modelo real dentro do produto:** o Modo Privacidade Estudante usa um modelo de visão computacional de verdade, o detector de rostos BlazeFace, executado pelo MediaPipe diretamente no navegador. A foto nunca sai do dispositivo do estudante para ser analisada, o que é coerente com a proposta de privacidade do modo. Quando o navegador oferece o detector nativo (Shape Detection API), ele é usado primeiro.

**Como conceito simulado na API:** a geração de resumo, flashcards, quiz e passos guiados dependeria, em produção, de OCR e de modelos de linguagem. Como o escopo acadêmico não inclui custear esses modelos, a API (`/api/estudar` e `/api/resolver`) gera o conteúdo a partir de templates por matéria, em `src/utils/ia-mock.js`. A mudança da Sprint 4 é que essa geração saiu do navegador e passou a rodar no servidor: para trocar a simulação por um modelo real, basta alterar `api/_lib/geracao.js`, sem mexer em nenhuma tela.

---

## Migração a partir do protótipo da Sprint 2

O protótipo da Sprint 2 tem cerca de 14 mil linhas de HTML, CSS e JavaScript puro. A migração foi seletiva, e não uma conversão literal, por duas razões: boa parte daquele código pertence ao conceito anterior do produto (a câmera que reconhece a cena), substituído pelo conceito atual focado no estudante; e o padrão do JavaScript vanilla, baseado em `querySelectorAll` e manipulação direta do DOM, produziria React de má qualidade se traduzido linha a linha.

**O que foi migrado:**

| Item | Origem no protótipo | Destino |
|---|---|---|
| Tokens de cor, tipografia, raios e sombras | `css/variables.css` | `src/styles/global.css` |
| Tipografia DM Sans e JetBrains Mono | `css/global.css` | `index.html` |
| Moldura do celular, visor e botão de captura | `css/camera.css` | `src/pages/Camera/Camera.jsx` (Tailwind) |
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

**O que ficou de fora, por pertencer ao conceito anterior:** os chips de sugestão adaptativa (a câmera que "aprende a rotina"), o modo silencioso automático noturno e o badge de "modo sugerido" — esses três eram a tese do conceito reprovado, a câmera que entende a cena. A tela de login ficou de fora na Sprint 3, quando o projeto ainda não tinha autenticação, e voltou nesta Sprint 4 junto com a API própria e as rotas privadas.

---

## Deploy na Vercel

**Link do deploy:** https://lenslabweb.vercel.app/

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
