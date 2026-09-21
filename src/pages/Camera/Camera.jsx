import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../../hooks/useCamera.js'
import { salvar, lerLista } from '../../services/photos.js'
import { tocarObturador, vibrar } from '../../utils/captura-efeitos.js'
import Icon from '../../components/Icon/Icon.jsx'
import { FolhaModos, FolhaAvancado } from './FolhasCamera.jsx'
import { BTN_PRIMARIO } from '../../styles/classes.js'
import {
  MODOS,
  MODOS_RAPIDOS,
  DESTINOS,
  AJUSTES_PADRAO,
  OPCOES_ZOOM,
  montarFiltro
} from '../../utils/modos-camera.js'

/**
 * Preto do aparelho, herdado do protótipo da Sprint 2. Não existe token
 * para ele: é a cor do corpo do celular, não uma superfície do app.
 */
const CHASSI = 'bg-[#050807]'

/** Para onde cada destino leva a foto recém-capturada. */
const ROTAS_DESTINO = {
  estuda: '/estuda-comigo',
  resolve: '/resolve-aqui',
  privacidade: '/privacidade'
}

/** Botão redondo de vidro fosco sobre o visor (flash, grade, timer). */
const CTRL =
  'relative grid h-9 w-9 place-items-center rounded-full border backdrop-blur-[8px] transition'
const CTRL_NORMAL =
  'border-white/12 bg-bg/55 text-white/90 hover:border-white/22 hover:bg-bg/80'
const CTRL_ATIVO = 'border-accent/40 bg-accent/18 text-accent'

/** Link discreto do rodapé do painel (Avançado, Enviar imagem). */
const LINK_PAINEL =
  'inline-flex items-center justify-center gap-[0.45rem] p-1 text-xs text-ink-3 transition hover:text-accent'

/**
 * Camera - Tela de captura, portada do protótipo da Sprint 2.
 *
 * A câmera completa do protótipo: 14 modos com filtro real, ajustes de
 * brilho/saturação/contraste, proporção, temporizador, grade, flash, zoom,
 * som de obturador e vibração. Tudo que o usuário vê no visor é gravado na
 * foto, porque o mesmo filtro vai para o ctx.filter do canvas de captura.
 *
 * O que o protótipo não tinha é a barra de destino: capturar com
 * "Estuda Comigo" ou "Resolve Aqui" selecionado leva direto para aquele
 * modo, com a foto junto. No destino "Foto" o usuário decide depois.
 *
 * O que era controlado por querySelectorAll e classes no protótipo virou
 * estado do React, e o estado desce por props para os componentes filhos.
 *
 * Estrutura pai -> filho:
 *   Camera (pai)
 *     |-- Visor (filho)
 *     |-- ControlesTopo (filho)
 *     |-- BarraCaptura (filho)
 *     |-- EscolhaDestino (filho)
 *     |-- FolhaModos (filho)
 *     |-- FolhaAvancado (filho)
 */
function Camera() {
  const navigate = useNavigate()
  const inputArquivo = useRef(null)
  const montado = useRef(true)
  const intervaloContagem = useRef(null)

  const { videoRef, facingMode, erro, ativa, trocarCamera, tentarNovamente, capturarFrame } = useCamera()

  // Modo de captura (filtro) e destino da foto
  const [modo, setModo] = useState('foto')
  const [destino, setDestino] = useState('foto')

  // Controles do visor
  const [grade, setGrade] = useState(false)
  const [flashLigado, setFlashLigado] = useState(false)
  const [zoom, setZoom] = useState(1)

  // Menu avançado
  const [ajustes, setAjustes] = useState(AJUSTES_PADRAO)
  const [proporcao, setProporcao] = useState('full')
  const [timer, setTimer] = useState(0)
  const [somLigado, setSomLigado] = useState(true)

  // Fluxo de captura
  const [folha, setFolha] = useState(null)
  const [contagem, setContagem] = useState(null)
  const [flash, setFlash] = useState(false)
  const [capturada, setCapturada] = useState(null)
  const [carimbo, setCarimbo] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState(null)

  // Miniatura da última captura, como no protótipo
  const [ultimaFoto] = useState(() => lerLista()[0]?.dataURL || null)

  // O corpo precisa remarcar o componente como montado: no StrictMode o
  // React monta, desmonta e monta de novo. Sem isso a flag ficava false
  // para sempre depois do segundo mount e a captura era ignorada em dev.
  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
      if (intervaloContagem.current) clearInterval(intervaloContagem.current)
    }
  }, [])

  const filtroCss = montarFiltro(modo, ajustes)
  const dadosModo = MODOS[modo]

  // O painel de destino aparece no modo Foto e sempre que salvar falhar,
  // para o usuário poder tentar de novo ou refazer a captura.
  const escolhendoDestino = capturada && (destino === 'foto' || !!erroSalvar)

  /** Contagem regressiva do temporizador */
  function rodarContagem(segundos) {
    return new Promise(resolve => {
      let restante = segundos
      setContagem(restante)

      intervaloContagem.current = setInterval(() => {
        restante -= 1
        if (restante <= 0) {
          clearInterval(intervaloContagem.current)
          intervaloContagem.current = null
          setContagem(null)
          resolve()
        } else {
          setContagem(restante)
        }
      }, 1000)
    })
  }

  async function capturar() {
    if (contagem !== null || salvando) return

    try {
      if (timer > 0) await rodarContagem(timer)
      if (!montado.current) return

      if (somLigado) tocarObturador()
      vibrar()

      setFlash(true)
      setTimeout(() => montado.current && setFlash(false), 220)

      const dataURL = capturarFrame({ filtro: filtroCss, proporcao, zoom })
      setCapturada(dataURL)

      setCarimbo(new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      }))
      setTimeout(() => montado.current && setCarimbo(null), 2600)

      // Nos modos do LensLab a foto já segue direto para a tela do modo
      if (destino !== 'foto') seguirPara(destino, dataURL)
    } catch (e) {
      console.error('[câmera] Erro na captura:', e)
    }
  }

  /** Fallback para quem corrige o projeto sem webcam disponível */
  function usarArquivo(evento) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return

    const leitor = new FileReader()
    leitor.onload = () => {
      setCapturada(leitor.result)
      if (destino !== 'foto') seguirPara(destino, leitor.result)
    }
    leitor.readAsDataURL(arquivo)
    evento.target.value = ''
  }

  async function seguirPara(paraOnde, imagem) {
    setSalvando(true)
    setErroSalvar(null)
    try {
      // A foto que vai para a Privacidade ainda não está protegida, então
      // é gravada como captura comum: o modo 'privacidade' fica reservado
      // para o resultado já desfocado, salvo pela própria tela do modo.
      const modoDaFoto = paraOnde === 'privacidade' ? 'foto' : paraOnde

      // O modo da câmera segue junto com a foto para a tela do modo de estudo
      const foto = await salvar(imagem, modoDaFoto, { modoCaptura: modo })
      navigate(ROTAS_DESTINO[paraOnde], { state: { fotoId: foto.id } })
    } catch (e) {
      console.error('[câmera] Erro ao salvar:', e)
      setErroSalvar(e.message || 'Não foi possível salvar a foto.')
      setSalvando(false)
    }
  }

  function refazer() {
    setCapturada(null)
    setErroSalvar(null)
  }

  function ajustar(chave, valor) {
    setAjustes(atual => ({ ...atual, [chave]: valor }))
  }

  return (
    <div className="relative flex min-h-[calc(100vh_-_var(--header-h))] flex-wrap items-center justify-center gap-10 overflow-hidden bg-bg px-5 py-10 text-ink min-[901px]:gap-16 min-[901px]:px-6 min-[901px]:py-12">
      <div className="fundo-camera pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-[1] max-w-[420px] min-[901px]:max-w-[380px]">
        <span className="mb-5 inline-block rounded-full border border-accent/20 bg-accent/6 px-[0.7rem] py-[0.3rem] font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-accent">
          Captura
        </span>
        <h1 className="mb-4 font-display text-[clamp(2rem,4vw,2.75rem)] font-bold leading-[1.05] tracking-[-0.04em]">
          Comece por uma <span className="text-accent">foto</span>
        </h1>
        <p className="mb-5 text-[0.95rem] leading-[1.65] text-ink-2">
          A câmera completa do LensLab: 14 modos com filtro real, ajustes de
          imagem, proporção e temporizador. Escolha na barra inferior se a
          foto vira material de estudo, resolução guiada, ou só uma foto.
        </p>
        <p className="border-l-2 border-accent/40 pl-[0.85rem] text-[0.85rem] leading-relaxed text-ink-3">
          Sem webcam à mão? Use "Enviar imagem" logo abaixo do visor: o fluxo é o mesmo.
        </p>
      </div>

      <div
        className={`relative z-[1] flex h-auto max-h-[820px] min-h-[620px] w-full max-w-[360px] flex-col overflow-hidden rounded-[32px] shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_0_0_8px_rgba(255,255,255,0.015),0_50px_90px_-30px_rgba(0,0,0,0.9)] min-[901px]:h-[82vh] min-[901px]:min-h-[640px] min-[901px]:max-w-[380px] ${CHASSI}`}
      >
        <div className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-[22px] py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            LensLab
          </span>
          <span
            className="animate-piscar h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]"
            aria-hidden="true"
          ></span>
        </div>

        <Visor
          videoRef={videoRef}
          facingMode={facingMode}
          filtroCss={filtroCss}
          zoom={zoom}
          grade={grade}
          flash={flash}
          contagem={contagem}
          carimbo={carimbo}
          capturada={capturada}
          erro={erro}
          ativa={ativa}
          modo={dadosModo}
          onTentarNovamente={tentarNovamente}
          onEnviarArquivo={() => inputArquivo.current?.click()}
        >
          {!capturada && (
            <>
              <ControlesTopo
                flashLigado={flashLigado}
                grade={grade}
                timer={timer}
                onFlash={() => setFlashLigado(!flashLigado)}
                onGrade={() => setGrade(!grade)}
                onAvancado={() => setFolha('avancado')}
              />

              <div className="absolute bottom-3.5 left-1/2 z-20 flex -translate-x-1/2 gap-1 rounded-full border border-white/10 bg-bg/55 p-1 backdrop-blur-[8px]">
                {OPCOES_ZOOM.map(fator => (
                  <button
                    key={fator}
                    className={`h-[26px] min-w-[30px] rounded-full px-2 font-mono text-[0.6875rem] transition ${
                      zoom === fator ? 'bg-white/16 text-white' : 'text-white/70 hover:text-white'
                    }`}
                    onClick={() => setZoom(fator)}
                    aria-pressed={zoom === fator}
                    aria-label={`Zoom ${fator}x`}
                  >
                    {fator === 1 ? '1×' : fator}
                  </button>
                ))}
              </div>
            </>
          )}
        </Visor>

        <div className={`flex flex-col gap-[0.7rem] border-t border-white/5 px-4 pb-5 pt-3 ${CHASSI}`}>
          {escolhendoDestino ? (
            <EscolhaDestino
              salvando={salvando}
              erro={erroSalvar}
              onEscolher={(paraOnde) => seguirPara(paraOnde, capturada)}
              onRefazer={refazer}
            />
          ) : (
            <>
              <div className="flex items-center gap-[0.35rem]">
                {MODOS_RAPIDOS.map(slug => {
                  const rapido = MODOS[slug]
                  const ativo = modo === slug

                  return (
                    <button
                      key={slug}
                      className={`inline-flex flex-1 items-center justify-center gap-[0.35rem] whitespace-nowrap rounded-full border px-2 py-[0.4rem] text-[0.6875rem] font-medium transition ${
                        ativo ? '' : 'border-line bg-white/[0.03] text-ink-3 hover:border-line-2 hover:text-ink'
                      }`}
                      // A cor é um dado do modo, então continua vindo inline
                      style={ativo ? {
                        color: rapido.cor,
                        borderColor: `color-mix(in srgb, ${rapido.cor} 45%, transparent)`,
                        backgroundColor: `color-mix(in srgb, ${rapido.cor} 14%, transparent)`
                      } : undefined}
                      onClick={() => setModo(ativo ? 'foto' : slug)}
                      aria-pressed={ativo}
                    >
                      <Icon nome={rapido.icone} tamanho={14} />
                      {rapido.nome}
                    </button>
                  )
                })}

                <button
                  className="grid h-7 w-[30px] shrink-0 place-items-center rounded-full border border-line bg-white/[0.03] text-ink-3 transition hover:border-accent/40 hover:text-accent"
                  onClick={() => setFolha('modos')}
                  aria-label="Ver todos os modos"
                  title="Todos os modos"
                >
                  <Icon nome="mais" tamanho={15} />
                </button>
              </div>

              <nav className="flex gap-0.5 rounded-sm bg-white/[0.04] p-[3px]" aria-label="Destino da foto">
                {DESTINOS.map(item => (
                  <button
                    key={item.id}
                    className={`flex-1 whitespace-nowrap rounded-xs px-[0.3rem] py-[0.45rem] text-[0.6875rem] transition ${
                      destino === item.id
                        ? 'bg-accent font-semibold text-bg'
                        : 'font-medium text-ink-3 hover:text-ink'
                    }`}
                    onClick={() => setDestino(item.id)}
                    aria-pressed={destino === item.id}
                    title={item.descricao}
                  >
                    {item.rotulo}
                  </button>
                ))}
              </nav>

              <BarraCaptura
                capturada={capturada || ultimaFoto}
                habilitado={ativa && contagem === null}
                onCapturar={capturar}
                onTrocarCamera={trocarCamera}
              />

              <button className={LINK_PAINEL} onClick={() => setFolha('avancado')}>
                <Icon nome="ajustes" tamanho={15} />
                Avançado
              </button>

              <button className={LINK_PAINEL} onClick={() => inputArquivo.current?.click()}>
                <Icon nome="enviar" tamanho={15} />
                Enviar imagem do dispositivo
              </button>
            </>
          )}
        </div>

        {folha === 'modos' && (
          <FolhaModos
            modoAtual={modo}
            onEscolher={(slug) => { setModo(slug); setFolha(null) }}
            onFechar={() => setFolha(null)}
          />
        )}

        {folha === 'avancado' && (
          <FolhaAvancado
            ajustes={ajustes}
            onAjustar={ajustar}
            proporcao={proporcao}
            onProporcao={setProporcao}
            timer={timer}
            onTimer={setTimer}
            somLigado={somLigado}
            onSom={setSomLigado}
            onRestaurar={() => setAjustes(AJUSTES_PADRAO)}
            onFechar={() => setFolha(null)}
          />
        )}
      </div>

      <input
        ref={inputArquivo}
        type="file"
        accept="image/*"
        onChange={usarArquivo}
        className="hidden"
        aria-label="Enviar uma imagem do dispositivo"
      />
    </div>
  )
}

/**
 * Visor - filho: o vídeo, a prévia e tudo que é sobreposto a eles
 */
function Visor({
  videoRef, facingMode, filtroCss, zoom, grade, flash, contagem, carimbo,
  capturada, erro, ativa, modo, onTentarNovamente, onEnviarArquivo, children
}) {
  const CAMADA_IMAGEM =
    'absolute inset-0 z-[1] h-full w-full bg-black object-cover transition-[filter,transform] duration-[250ms]'

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-bg-soft">
      {capturada ? (
        <img src={capturada} alt="Prévia da foto capturada" className={CAMADA_IMAGEM} />
      ) : (
        <>
          {/* O espelhamento da câmera frontal entra no mesmo transform do
              zoom: um style inline sobrescreveria a regra do CSS. */}
          <video
            ref={videoRef}
            className={CAMADA_IMAGEM}
            playsInline
            muted
            style={{
              filter: filtroCss,
              transform: `scale(${facingMode === 'user' ? -zoom : zoom}, ${zoom})`
            }}
          />
          {grade && (
            <div className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
              <span className="absolute inset-y-0 w-px bg-white/22" style={{ left: '33.33%' }} />
              <span className="absolute inset-y-0 w-px bg-white/22" style={{ left: '66.66%' }} />
              <span className="absolute inset-x-0 h-px bg-white/22" style={{ top: '33.33%' }} />
              <span className="absolute inset-x-0 h-px bg-white/22" style={{ top: '66.66%' }} />
            </div>
          )}
        </>
      )}

      {children}

      {!capturada && modo && modo.nome !== 'Foto' && (
        <span
          className="animate-surgir-badge absolute left-1/2 top-[92px] z-20 inline-flex -translate-x-1/2 items-center gap-[0.35rem] rounded-full border bg-bg/60 px-[0.7rem] py-[0.3rem] font-mono text-[0.625rem] uppercase tracking-[0.1em] backdrop-blur-[8px]"
          style={{
            color: modo.cor,
            borderColor: `color-mix(in srgb, ${modo.cor} 45%, transparent)`
          }}
        >
          <Icon nome={modo.icone} tamanho={13} />
          {modo.nome}
        </span>
      )}

      {contagem !== null && (
        <div
          className="absolute inset-0 z-30 grid place-items-center bg-[#050807]/45"
          aria-live="assertive"
        >
          <span
            key={contagem}
            className="animate-pulsar-numero text-[5rem] font-bold tracking-[-0.04em] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.6)]"
          >
            {contagem}
          </span>
        </div>
      )}

      {carimbo && (
        <span className="animate-surgir-badge absolute bottom-[52px] right-3.5 z-[22] font-mono text-[0.625rem] tracking-[0.08em] text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
          {carimbo}
        </span>
      )}

      {flash && (
        <div className="animate-clarao absolute inset-0 z-[35] bg-white" aria-hidden="true" />
      )}

      {erro && !capturada && (
        <div
          className="relative z-[25] m-5 flex flex-col items-center gap-[0.9rem] rounded-md border border-line-2 bg-bg/90 px-6 py-7 text-center backdrop-blur-[10px]"
          role="alert"
        >
          <span className="grid h-[42px] w-[42px] place-items-center rounded-sm bg-danger/12 text-danger">
            <Icon nome="cameraOff" tamanho={22} />
          </span>
          <p className="text-sm leading-[1.55] text-ink-2">{erro}</p>
          <button className={BTN_PRIMARIO} onClick={onTentarNovamente}>
            Tentar novamente
          </button>
          <button
            className="p-1 text-[0.8125rem] text-ink-3 transition hover:text-accent"
            onClick={onEnviarArquivo}
          >
            Enviar uma imagem
          </button>
        </div>
      )}

      {!erro && !ativa && !capturada && (
        <p className="relative z-[2] animate-pulse font-mono text-xs tracking-[0.08em] text-ink-3">
          Ligando a câmera...
        </p>
      )}
    </div>
  )
}

/**
 * ControlesTopo - filho: flash, grade, temporizador e menu avançado
 */
function ControlesTopo({ flashLigado, grade, timer, onFlash, onGrade, onAvancado }) {
  return (
    <div className="absolute inset-x-0 top-[46px] z-20 flex items-center justify-between px-4">
      <button
        className={`${CTRL} ${flashLigado ? CTRL_ATIVO : CTRL_NORMAL}`}
        onClick={onFlash}
        aria-pressed={flashLigado}
        aria-label="Alternar flash"
        title="Flash"
      >
        <Icon nome={flashLigado ? 'raio' : 'flashOff'} tamanho={17} />
      </button>

      <div className="flex gap-[0.4rem]">
        <button
          className={`${CTRL} ${grade ? CTRL_ATIVO : CTRL_NORMAL}`}
          onClick={onGrade}
          aria-pressed={grade}
          aria-label="Grade 3x3"
          title="Grade 3x3"
        >
          <Icon nome="grade" tamanho={17} />
        </button>

        <button
          className={`${CTRL} ${timer > 0 ? CTRL_ATIVO : CTRL_NORMAL}`}
          onClick={onAvancado}
          aria-label="Temporizador"
          title="Temporizador"
        >
          <Icon nome="relogio" tamanho={17} />
          {timer > 0 && (
            <span className="absolute -bottom-[3px] -right-[3px] grid h-[15px] min-w-[15px] place-items-center rounded-full bg-accent px-[3px] font-mono text-[9px] font-semibold text-bg">
              {timer}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * BarraCaptura - filho: miniatura, botão de captura e troca de câmera
 */
function BarraCaptura({ capturada, habilitado, onCapturar, onTrocarCamera }) {
  return (
    <div className="flex items-center justify-between px-5 py-[0.15rem]">
      <span
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-sm border border-line bg-white/[0.03] text-ink-3"
        aria-hidden="true"
      >
        {capturada
          ? <img src={capturada} alt="" className="h-full w-full object-cover" />
          : <Icon nome="imagem" tamanho={16} />}
      </span>

      <button
        className="group grid h-[62px] w-[62px] place-items-center rounded-full border-2 border-white/55 bg-transparent transition-transform duration-150 disabled:cursor-not-allowed disabled:opacity-35 enabled:hover:border-white enabled:active:scale-[0.94]"
        onClick={onCapturar}
        disabled={!habilitado}
        aria-label="Capturar foto"
      >
        <span className="h-[50px] w-[50px] rounded-full bg-accent shadow-[0_0_24px_-4px_rgba(0,200,150,0.6)] transition-colors group-enabled:group-hover:bg-accent-hi" />
      </button>

      <button
        className="grid h-10 w-10 place-items-center rounded-sm border border-line bg-white/[0.03] text-ink-2 transition hover:border-line-2 hover:bg-white/6 hover:text-ink"
        onClick={onTrocarCamera}
        title="Trocar de câmera"
        aria-label="Trocar de câmera"
      >
        <Icon nome="girar" tamanho={19} />
      </button>
    </div>
  )
}

/**
 * EscolhaDestino - filho: o que fazer com a foto recém-capturada
 */
function EscolhaDestino({ salvando, erro, onEscolher, onRefazer }) {
  return (
    <div className="flex flex-col gap-[0.55rem]">
      <p className="mb-1 text-center font-mono text-[0.625rem] uppercase tracking-[0.14em] text-ink-3">
        O que você quer fazer com esta foto?
      </p>

      {erro && (
        <p
          className="flex items-start gap-2 rounded-sm border border-danger/30 bg-danger/10 px-3 py-[0.6rem] text-xs leading-[1.45] text-danger"
          role="alert"
        >
          <Icon nome="cameraOff" tamanho={15} />
          {erro}
        </p>
      )}

      <BotaoDestino
        icone="livro"
        titulo="Estuda Comigo"
        descricao="Resumo, flashcards e quiz"
        onClick={() => onEscolher('estuda')}
        desabilitado={salvando}
      />

      <BotaoDestino
        icone="calculadora"
        titulo="Resolve Aqui"
        descricao="Resolução guiada passo a passo"
        onClick={() => onEscolher('resolve')}
        desabilitado={salvando}
      />

      <BotaoDestino
        icone="usuarios"
        titulo="Proteger rostos"
        descricao="Desfocar rostos antes de postar"
        onClick={() => onEscolher('privacidade')}
        desabilitado={salvando}
      />

      <button
        className="p-[0.4rem] text-center text-[0.8125rem] text-ink-3 transition enabled:hover:text-ink"
        onClick={onRefazer}
        disabled={salvando}
      >
        Refazer a foto
      </button>
    </div>
  )
}

/**
 * BotaoDestino - filho da EscolhaDestino: um caminho possível para a foto.
 */
function BotaoDestino({ icone, titulo, descricao, onClick, desabilitado }) {
  return (
    <button
      className="group flex items-center gap-[0.85rem] rounded-sm border border-line bg-white/[0.03] px-[0.9rem] py-[0.8rem] text-left text-ink transition disabled:cursor-not-allowed disabled:opacity-45 enabled:hover:border-accent/40 enabled:hover:bg-accent/6"
      onClick={onClick}
      disabled={desabilitado}
    >
      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-xs bg-accent/12 text-accent">
        <Icon nome={icone} tamanho={19} />
      </span>
      <span className="flex-1">
        <strong className="block text-[0.9375rem] font-semibold tracking-[-0.01em]">{titulo}</strong>
        <small className="text-xs text-ink-3">{descricao}</small>
      </span>
      <span className="ml-auto text-ink-3 transition group-enabled:group-hover:translate-x-0.5 group-enabled:group-hover:text-accent">
        <Icon nome="setaDireita" tamanho={16} />
      </span>
    </button>
  )
}

export default Camera
