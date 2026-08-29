import { useEffect } from 'react'
import Icon from '../../components/Icon/Icon.jsx'
import {
  MODOS,
  TODOS_OS_MODOS,
  OPCOES_PROPORCAO,
  OPCOES_TIMER,
  AJUSTES_PADRAO
} from '../../utils/modos-camera.js'
import styles from './Camera.module.css'

/**
 * Folha - componente base das folhas que sobem da parte de baixo do
 * celular (bottom sheets do protótipo da Sprint 2).
 *
 * Fecha no clique do fundo e no Esc.
 */
function Folha({ titulo, subtitulo, onFechar, children }) {
  useEffect(() => {
    function aoTeclar(evento) {
      if (evento.key === 'Escape') onFechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [onFechar])

  return (
    <div className={styles.folhaOverlay} role="dialog" aria-modal="true" aria-label={titulo}>
      <div className={styles.folhaFundo} onClick={onFechar} />
      <div className={styles.folha}>
        <span className={styles.folhaAlca} aria-hidden="true" />

        <header className={styles.folhaHeader}>
          <div>
            <h3>{titulo}</h3>
            {subtitulo && <p>{subtitulo}</p>}
          </div>
          <button className={styles.folhaFechar} onClick={onFechar} aria-label="Fechar">
            <Icon nome="x" tamanho={16} />
          </button>
        </header>

        <div className={styles.folhaCorpo}>{children}</div>
      </div>
    </div>
  )
}

/**
 * FolhaModos - filho: lista todos os modos de captura com o filtro de cada um
 */
export function FolhaModos({ modoAtual, onEscolher, onFechar }) {
  return (
    <Folha
      titulo="Modos de captura"
      subtitulo="Cada modo aplica um tratamento diferente na imagem"
      onFechar={onFechar}
    >
      <button
        className={`${styles.modoItem} ${modoAtual === 'foto' ? styles.modoItemAtivo : ''}`}
        onClick={() => onEscolher('foto')}
        style={{ '--tom-modo': MODOS.foto.cor }}
      >
        <span className={styles.modoItemIcone}>
          <Icon nome={MODOS.foto.icone} tamanho={18} />
        </span>
        <span className={styles.modoItemTexto}>
          <strong>{MODOS.foto.nome}</strong>
          <small>{MODOS.foto.descricao}</small>
        </span>
        {modoAtual === 'foto' && <Icon nome="check" tamanho={16} traco={2.2} />}
      </button>

      <div className={styles.folhaSeparador} />

      <div className={styles.modosGrid}>
        {TODOS_OS_MODOS.map(slug => {
          const modo = MODOS[slug]
          const ativo = modoAtual === slug

          return (
            <button
              key={slug}
              className={`${styles.modoItem} ${ativo ? styles.modoItemAtivo : ''}`}
              onClick={() => onEscolher(slug)}
              style={{ '--tom-modo': modo.cor }}
            >
              <span className={styles.modoItemIcone}>
                <Icon nome={modo.icone} tamanho={18} />
              </span>
              <span className={styles.modoItemTexto}>
                <strong>{modo.nome}</strong>
                <small>{modo.descricao}</small>
              </span>
              {ativo && <Icon nome="check" tamanho={16} traco={2.2} />}
            </button>
          )
        })}
      </div>
    </Folha>
  )
}

/**
 * FolhaAvancado - filho: ajustes finos de imagem, composição e captura
 */
export function FolhaAvancado({
  ajustes,
  onAjustar,
  proporcao,
  onProporcao,
  timer,
  onTimer,
  somLigado,
  onSom,
  onRestaurar,
  onFechar
}) {
  const controles = [
    { chave: 'brilho', rotulo: 'Brilho', min: 50, max: 150 },
    { chave: 'saturacao', rotulo: 'Saturação', min: 0, max: 200 },
    { chave: 'contraste', rotulo: 'Contraste', min: 50, max: 200 }
  ]

  const alterado =
    ajustes.brilho !== AJUSTES_PADRAO.brilho ||
    ajustes.saturacao !== AJUSTES_PADRAO.saturacao ||
    ajustes.contraste !== AJUSTES_PADRAO.contraste

  return (
    <Folha
      titulo="Controles avançados"
      subtitulo="Ajuste fino da imagem e da captura"
      onFechar={onFechar}
    >
      <h4 className={styles.folhaGrupo}>Ajustes</h4>

      {controles.map(controle => (
        <div key={controle.chave} className={styles.sliderBloco}>
          <label className={styles.sliderHeader} htmlFor={`ctrl-${controle.chave}`}>
            <span>{controle.rotulo}</span>
            <strong>{ajustes[controle.chave]}%</strong>
          </label>
          <input
            id={`ctrl-${controle.chave}`}
            type="range"
            className={styles.slider}
            min={controle.min}
            max={controle.max}
            value={ajustes[controle.chave]}
            onChange={(e) => onAjustar(controle.chave, Number(e.target.value))}
          />
        </div>
      ))}

      {alterado && (
        <button className={styles.restaurarBtn} onClick={onRestaurar}>
          <Icon nome="girar" tamanho={15} />
          Restaurar padrão
        </button>
      )}

      <h4 className={styles.folhaGrupo}>Composição</h4>

      <div className={styles.segmentado}>
        <span className={styles.segmentadoLabel}>
          <Icon nome="proporcao" tamanho={15} />
          Proporção
        </span>
        <div className={styles.segmentadoOpcoes}>
          {OPCOES_PROPORCAO.map(opcao => (
            <button
              key={opcao.id}
              className={`${styles.segBtn} ${proporcao === opcao.id ? styles.segBtnAtivo : ''}`}
              onClick={() => onProporcao(opcao.id)}
              aria-pressed={proporcao === opcao.id}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.segmentado}>
        <span className={styles.segmentadoLabel}>
          <Icon nome="relogio" tamanho={15} />
          Temporizador
        </span>
        <div className={styles.segmentadoOpcoes}>
          {OPCOES_TIMER.map(segundos => (
            <button
              key={segundos}
              className={`${styles.segBtn} ${timer === segundos ? styles.segBtnAtivo : ''}`}
              onClick={() => onTimer(segundos)}
              aria-pressed={timer === segundos}
            >
              {segundos === 0 ? 'Off' : `${segundos}s`}
            </button>
          ))}
        </div>
      </div>

      <h4 className={styles.folhaGrupo}>Captura</h4>

      <button className={styles.linhaToggle} onClick={() => onSom(!somLigado)} aria-pressed={somLigado}>
        <Icon nome={somLigado ? 'som' : 'somOff'} tamanho={17} />
        <span className={styles.linhaToggleTexto}>
          <strong>Som do obturador</strong>
          <small>Clique sintetizado no momento da foto</small>
        </span>
        <span className={`${styles.chave} ${somLigado ? styles.chaveAtiva : ''}`} aria-hidden="true" />
      </button>
    </Folha>
  )
}
