import { useEffect } from 'react'
import Icon from '../../components/Icon/Icon.jsx'
import {
  MODOS,
  TODOS_OS_MODOS,
  OPCOES_PROPORCAO,
  OPCOES_TIMER,
  AJUSTES_PADRAO
} from '../../utils/modos-camera.js'

/** Título de grupo dentro de uma folha. */
const GRUPO =
  'mb-[0.35rem] mt-[0.9rem] font-mono text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink-3 first:mt-0'

/** Trilho de um controle segmentado (proporção, temporizador). */
const SEGMENTADO = 'flex gap-0.5 rounded-sm bg-white/[0.04] p-[3px]'

/** Item de modo na lista da folha de modos. */
const MODO_ITEM =
  'flex w-full items-center gap-3 rounded-sm border px-[0.7rem] py-[0.6rem] text-left transition'

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
    <div
      className="absolute inset-0 z-[60] flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
    >
      <div
        className="animate-aparecer-fundo absolute inset-0 bg-[#050807]/60 backdrop-blur-[3px]"
        onClick={onFechar}
      />
      <div className="animate-subir-folha relative flex max-h-[82%] w-full flex-col rounded-t-xl border-t border-line-2 bg-surface px-[1.15rem] pb-5 pt-[0.6rem]">
        <span
          className="mx-auto mb-[0.85rem] h-1 w-9 shrink-0 rounded-full bg-line-2"
          aria-hidden="true"
        />

        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line pb-[0.85rem]">
          <div>
            <h3 className="text-base tracking-[-0.02em] text-ink">{titulo}</h3>
            {subtitulo && <p className="mt-[0.15rem] text-xs text-ink-3">{subtitulo}</p>}
          </div>
          <button
            className="grid h-7 w-7 shrink-0 place-items-center rounded-xs text-ink-3 transition hover:bg-white/6 hover:text-ink"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <Icon nome="x" tamanho={16} />
          </button>
        </header>

        <div className="flex flex-col gap-[0.35rem] overflow-y-auto pt-[0.85rem]">{children}</div>
      </div>
    </div>
  )
}

/**
 * ItemModo - filho das folhas: uma opção de modo de captura.
 * A cor vem do próprio modo, por isso as pinceladas vão inline.
 */
function ItemModo({ modo, ativo, onEscolher }) {
  return (
    <button
      className={`${MODO_ITEM} ${
        ativo
          ? 'text-ink'
          : 'border-transparent bg-white/[0.02] text-ink-2 hover:border-line hover:bg-white/5'
      }`}
      onClick={onEscolher}
      style={
        ativo
          ? {
              borderColor: `color-mix(in srgb, ${modo.cor} 45%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${modo.cor} 10%, transparent)`
            }
          : undefined
      }
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-xs"
        style={{
          color: modo.cor,
          backgroundColor: `color-mix(in srgb, ${modo.cor} 14%, transparent)`
        }}
      >
        <Icon nome={modo.icone} tamanho={18} />
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-semibold tracking-[-0.01em] text-ink">
          {modo.nome}
        </strong>
        <small className="text-[0.6875rem] text-ink-3">{modo.descricao}</small>
      </span>
      {ativo && (
        <span className="ml-auto" style={{ color: modo.cor }}>
          <Icon nome="check" tamanho={16} traco={2.2} />
        </span>
      )}
    </button>
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
      <ItemModo
        modo={MODOS.foto}
        ativo={modoAtual === 'foto'}
        onEscolher={() => onEscolher('foto')}
      />

      <div className="my-2 h-px bg-line" />

      <div className="flex flex-col gap-[0.3rem]">
        {TODOS_OS_MODOS.map(slug => (
          <ItemModo
            key={slug}
            modo={MODOS[slug]}
            ativo={modoAtual === slug}
            onEscolher={() => onEscolher(slug)}
          />
        ))}
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
      <h4 className={GRUPO}>Ajustes</h4>

      {controles.map(controle => (
        <div key={controle.chave} className="py-2">
          <label
            className="mb-2 flex cursor-pointer items-baseline justify-between text-[0.8125rem] text-ink-2"
            htmlFor={`ctrl-${controle.chave}`}
          >
            <span>{controle.rotulo}</span>
            <strong className="font-mono text-xs tabular-nums text-accent">
              {ajustes[controle.chave]}%
            </strong>
          </label>
          <input
            id={`ctrl-${controle.chave}`}
            type="range"
            className="slider-camera"
            min={controle.min}
            max={controle.max}
            value={ajustes[controle.chave]}
            onChange={(e) => onAjustar(controle.chave, Number(e.target.value))}
          />
        </div>
      ))}

      {alterado && (
        <button
          className="mt-[0.35rem] inline-flex items-center justify-center gap-[0.4rem] self-start rounded-sm border border-line px-3 py-[0.4rem] text-xs text-ink-3 transition hover:border-accent/40 hover:text-accent"
          onClick={onRestaurar}
        >
          <Icon nome="girar" tamanho={15} />
          Restaurar padrão
        </button>
      )}

      <h4 className={GRUPO}>Composição</h4>

      <div className="py-[0.4rem]">
        <span className="mb-2 flex items-center gap-[0.45rem] text-[0.8125rem] text-ink-2 [&>svg]:text-ink-3">
          <Icon nome="proporcao" tamanho={15} />
          Proporção
        </span>
        <div className={SEGMENTADO}>
          {OPCOES_PROPORCAO.map(opcao => (
            <BotaoSegmento
              key={opcao.id}
              ativo={proporcao === opcao.id}
              onClick={() => onProporcao(opcao.id)}
            >
              {opcao.rotulo}
            </BotaoSegmento>
          ))}
        </div>
      </div>

      <div className="py-[0.4rem]">
        <span className="mb-2 flex items-center gap-[0.45rem] text-[0.8125rem] text-ink-2 [&>svg]:text-ink-3">
          <Icon nome="relogio" tamanho={15} />
          Temporizador
        </span>
        <div className={SEGMENTADO}>
          {OPCOES_TIMER.map(segundos => (
            <BotaoSegmento
              key={segundos}
              ativo={timer === segundos}
              onClick={() => onTimer(segundos)}
            >
              {segundos === 0 ? 'Off' : `${segundos}s`}
            </BotaoSegmento>
          ))}
        </div>
      </div>

      <h4 className={GRUPO}>Captura</h4>

      <button
        className="flex w-full items-center gap-3 rounded-sm border border-line bg-white/[0.02] px-[0.7rem] py-[0.6rem] text-left text-ink-2 transition hover:border-line-2"
        onClick={() => onSom(!somLigado)}
        aria-pressed={somLigado}
      >
        <Icon nome={somLigado ? 'som' : 'somOff'} tamanho={17} />
        <span className="flex-1">
          <strong className="block text-[0.8125rem] font-semibold text-ink">
            Som do obturador
          </strong>
          <small className="text-[0.6875rem] text-ink-3">
            Clique sintetizado no momento da foto
          </small>
        </span>
        <span
          className={`relative h-[19px] w-[34px] shrink-0 rounded-full transition-colors ${
            somLigado ? 'bg-accent/40' : 'bg-surface-3'
          }`}
          aria-hidden="true"
        >
          <span
            className={`absolute left-[2.5px] top-[2.5px] h-3.5 w-3.5 rounded-full transition ${
              somLigado ? 'translate-x-[15px] bg-accent' : 'bg-ink-3'
            }`}
          />
        </span>
      </button>
    </Folha>
  )
}

/**
 * BotaoSegmento - filho: uma opção dentro de um controle segmentado.
 */
function BotaoSegmento({ ativo, onClick, children }) {
  return (
    <button
      className={`flex-1 rounded-xs px-1 py-[0.4rem] font-mono text-[0.6875rem] transition ${
        ativo ? 'bg-accent/20 text-accent' : 'text-ink-3 hover:text-ink'
      }`}
      onClick={onClick}
      aria-pressed={ativo}
    >
      {children}
    </button>
  )
}
