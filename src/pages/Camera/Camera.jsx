import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '../../hooks/useCamera.js'
import { salvar, lerLista } from '../../services/photos.js'
import { tocarObturador, vibrar } from '../../utils/captura-efeitos.js'
import Icon from '../../components/Icon/Icon.jsx'
import { FolhaModos, FolhaAvancado } from './FolhasCamera.jsx'
import {
  MODOS,
  MODOS_RAPIDOS,
  DESTINOS,
  AJUSTES_PADRAO,
  OPCOES_ZOOM,
  montarFiltro
} from '../../utils/modos-camera.js'
import styles from './Camera.module.css'

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
      // O modo da câmera segue junto com a foto para a tela do modo de estudo
      const foto = await salvar(imagem, paraOnde, { modoCaptura: modo })
      navigate(paraOnde === 'estuda' ? '/estuda-comigo' : '/resolve-aqui', {
        state: { fotoId: foto.id }
      })
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
    <div className={styles.page}>
      <div className={styles.fundo} aria-hidden="true" />

      <div className={styles.intro}>
        <span className={styles.eyebrow}>Captura</span>
        <h1>Comece por uma <span className={styles.highlight}>foto</span></h1>
        <p>
          A câmera completa do LensLab: 14 modos com filtro real, ajustes de
          imagem, proporção e temporizador. Escolha na barra inferior se a
          foto vira material de estudo, resolução guiada, ou só uma foto.
        </p>
        <p className={styles.dica}>
          Sem webcam à mão? Use "Enviar imagem" logo abaixo do visor: o fluxo é o mesmo.
        </p>
      </div>

      <div className={styles.app}>
        <div className={styles.statusBar}>
          <span className={styles.statusMarca}>LensLab</span>
          <span className={styles.statusDot} aria-hidden="true"></span>
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

              <div className={styles.zoomControles}>
                {OPCOES_ZOOM.map(fator => (
                  <button
                    key={fator}
                    className={`${styles.zoomBtn} ${zoom === fator ? styles.zoomAtivo : ''}`}
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

        <div className={styles.bottomPanel}>
          {escolhendoDestino ? (
            <EscolhaDestino
              salvando={salvando}
              erro={erroSalvar}
              onEscolher={(paraOnde) => seguirPara(paraOnde, capturada)}
              onRefazer={refazer}
            />
          ) : (
            <>
              <div className={styles.chips}>
                {MODOS_RAPIDOS.map(slug => {
                  const rapido = MODOS[slug]
                  const ativo = modo === slug

                  return (
                    <button
                      key={slug}
                      className={`${styles.chip} ${ativo ? styles.chipAtivo : ''}`}
                      style={{ '--tom-modo': rapido.cor }}
                      onClick={() => setModo(ativo ? 'foto' : slug)}
                      aria-pressed={ativo}
                    >
                      <Icon nome={rapido.icone} tamanho={14} />
                      {rapido.nome}
                    </button>
                  )
                })}

                <button
                  className={styles.chipMais}
                  onClick={() => setFolha('modos')}
                  aria-label="Ver todos os modos"
                  title="Todos os modos"
                >
                  <Icon nome="mais" tamanho={15} />
                </button>
              </div>

              <nav className={styles.destinos} aria-label="Destino da foto">
                {DESTINOS.map(item => (
                  <button
                    key={item.id}
                    className={`${styles.destinoItem} ${destino === item.id ? styles.destinoAtivo : ''}`}
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

              <button className={styles.avancadoLink} onClick={() => setFolha('avancado')}>
                <Icon nome="ajustes" tamanho={15} />
                Avançado
              </button>

              <button className={styles.enviarBtn} onClick={() => inputArquivo.current?.click()}>
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
        className={styles.inputEscondido}
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
  return (
    <div className={styles.viewfinder}>
      {capturada ? (
        <img src={capturada} alt="Prévia da foto capturada" className={styles.preview} />
      ) : (
        <>
          {/* O espelhamento da câmera frontal entra no mesmo transform do
              zoom: um style inline sobrescreveria a regra do CSS. */}
          <video
            ref={videoRef}
            className={styles.video}
            playsInline
            muted
            style={{
              filter: filtroCss,
              transform: `scale(${facingMode === 'user' ? -zoom : zoom}, ${zoom})`
            }}
          />
          {grade && (
            <div className={styles.grade} aria-hidden="true">
              <span className={styles.linhaV} style={{ left: '33.33%' }} />
              <span className={styles.linhaV} style={{ left: '66.66%' }} />
              <span className={styles.linhaH} style={{ top: '33.33%' }} />
              <span className={styles.linhaH} style={{ top: '66.66%' }} />
            </div>
          )}
        </>
      )}

      {children}

      {!capturada && modo && modo.nome !== 'Foto' && (
        <span className={styles.badgeModo} style={{ '--tom-modo': modo.cor }}>
          <Icon nome={modo.icone} tamanho={13} />
          {modo.nome}
        </span>
      )}

      {contagem !== null && (
        <div className={styles.contagem} aria-live="assertive">
          <span key={contagem}>{contagem}</span>
        </div>
      )}

      {carimbo && <span className={styles.carimbo}>{carimbo}</span>}

      {flash && <div className={styles.flashOverlay} aria-hidden="true" />}

      {erro && !capturada && (
        <div className={styles.erro} role="alert">
          <span className={styles.erroIcone}>
            <Icon nome="cameraOff" tamanho={22} />
          </span>
          <p>{erro}</p>
          <button className="btn btn-primary" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
          <button className={styles.linkBtn} onClick={onEnviarArquivo}>
            Enviar uma imagem
          </button>
        </div>
      )}

      {!erro && !ativa && !capturada && (
        <p className={styles.carregando}>Ligando a câmera...</p>
      )}
    </div>
  )
}

/**
 * ControlesTopo - filho: flash, grade, temporizador e menu avançado
 */
function ControlesTopo({ flashLigado, grade, timer, onFlash, onGrade, onAvancado }) {
  return (
    <div className={styles.topControls}>
      <button
        className={`${styles.ctrlBtn} ${flashLigado ? styles.ctrlAtivo : ''}`}
        onClick={onFlash}
        aria-pressed={flashLigado}
        aria-label="Alternar flash"
        title="Flash"
      >
        <Icon nome={flashLigado ? 'raio' : 'flashOff'} tamanho={17} />
      </button>

      <div className={styles.topControlsDireita}>
        <button
          className={`${styles.ctrlBtn} ${grade ? styles.ctrlAtivo : ''}`}
          onClick={onGrade}
          aria-pressed={grade}
          aria-label="Grade 3x3"
          title="Grade 3x3"
        >
          <Icon nome="grade" tamanho={17} />
        </button>

        <button
          className={`${styles.ctrlBtn} ${timer > 0 ? styles.ctrlAtivo : ''}`}
          onClick={onAvancado}
          aria-label="Temporizador"
          title="Temporizador"
        >
          <Icon nome="relogio" tamanho={17} />
          {timer > 0 && <span className={styles.timerBadge}>{timer}</span>}
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
    <div className={styles.capturaRow}>
      <span className={styles.miniatura} aria-hidden="true">
        {capturada
          ? <img src={capturada} alt="" />
          : <Icon nome="imagem" tamanho={16} />}
      </span>

      <button
        className={styles.capturaBtn}
        onClick={onCapturar}
        disabled={!habilitado}
        aria-label="Capturar foto"
      >
        <span className={styles.capturaInner} />
      </button>

      <button
        className={styles.controleBtn}
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
    <div className={styles.destino}>
      <p className={styles.destinoTitulo}>O que você quer fazer com esta foto?</p>

      {erro && (
        <p className={styles.erroSalvar} role="alert">
          <Icon nome="cameraOff" tamanho={15} />
          {erro}
        </p>
      )}

      <button
        className={styles.destinoBtn}
        onClick={() => onEscolher('estuda')}
        disabled={salvando}
      >
        <span className={styles.destinoIcone}>
          <Icon nome="livro" tamanho={19} />
        </span>
        <span className={styles.destinoTexto}>
          <strong>Estuda Comigo</strong>
          <small>Resumo, flashcards e quiz</small>
        </span>
        <Icon nome="setaDireita" tamanho={16} />
      </button>

      <button
        className={styles.destinoBtn}
        onClick={() => onEscolher('resolve')}
        disabled={salvando}
      >
        <span className={styles.destinoIcone}>
          <Icon nome="calculadora" tamanho={19} />
        </span>
        <span className={styles.destinoTexto}>
          <strong>Resolve Aqui</strong>
          <small>Resolução guiada passo a passo</small>
        </span>
        <Icon nome="setaDireita" tamanho={16} />
      </button>

      <button className={styles.refazerBtn} onClick={onRefazer} disabled={salvando}>
        Refazer a foto
      </button>
    </div>
  )
}

export default Camera
