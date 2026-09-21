import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePrivacidade } from '../../hooks/usePrivacidade.js'

/**
 * Privacidade - Modo Privacidade Estudante (novidade da Sprint 4).
 *
 * Antes de postar uma foto em grupo, o estudante decide, rosto a rosto,
 * quem aparece nítido e quem é desfocado. Toda a lógica está em
 * usePrivacidade; aqui ficam apenas os componentes visuais.
 *
 * Estrutura pai -> filho:
 *   Privacidade (pai)
 *     |-- EscolherFoto (filho)
 *     |-- Editor (filho)
 *     |     |-- CaixaRosto (filho, repetido)
 *     |-- PainelRostos (filho)
 *           |-- ItemRosto (filho, repetido)
 */
function Privacidade() {
  const navigate = useNavigate()
  const location = useLocation()
  // A camera manda a foto recem-capturada por aqui
  const p = usePrivacidade(location.state?.fotoId || null)
  const [mensagem, setMensagem] = useState('')

  async function salvar() {
    const foto = await p.salvarNaGaleria()
    if (foto) {
      setMensagem('Foto protegida salva na galeria.')
      setTimeout(() => navigate('/galeria'), 900)
    }
  }

  function baixar() {
    const dataURL = p.exportar()
    if (!dataURL) return
    const link = document.createElement('a')
    link.href = dataURL
    link.download = `lenslab-privacidade-${Date.now()}.jpg`
    link.click()
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="border-b border-line bg-bg-soft px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            Novo · Modo Privacidade Estudante
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
            Você decide <span className="text-accent">quem aparece</span> na foto
          </h1>
          <p className="mt-3 max-w-2xl text-ink-2">
            Antes de postar a foto da turma, o LensLab encontra cada rosto e deixa você escolher,
            um por um, quem fica nítido e quem é desfocado.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-6xl px-4">
        {p.estado === 'vazio' && (
          <EscolherFoto
            fotos={p.fotosGaleria()}
            aviso={p.aviso}
            onEscolher={p.escolherImagem}
            onArquivo={p.aoEnviarArquivo}
          />
        )}

        {p.estado === 'detectando' && (
          <div role="status" className="flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-20 text-center">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-line-2 border-t-accent" />
            <p className="mt-5 font-semibold text-ink">Procurando rostos na imagem...</p>
            <p className="mt-1 text-sm text-ink-2">Na primeira vez, o modelo de detecção é baixado. Pode levar alguns segundos.</p>
          </div>
        )}

        {p.estado === 'pronto' && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Editor
              canvasRef={p.canvasRef}
              regioes={p.regioes}
              onAlternar={p.alternar}
              onMarcar={p.marcarManual}
              aviso={p.aviso}
            />
            <PainelRostos
              regioes={p.regioes}
              motor={p.motor}
              totalDesfocados={p.totalDesfocados}
              intensidade={p.intensidade}
              setIntensidade={p.setIntensidade}
              salvando={p.salvando}
              mensagem={mensagem}
              onAlternar={p.alternar}
              onRemover={p.remover}
              onTodos={p.definirTodos}
              onSalvar={salvar}
              onBaixar={baixar}
              onRecomecar={p.recomecar}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * EscolherFoto - filho: upload ou escolha de uma foto já capturada
 */
function EscolherFoto({ fotos, aviso, onEscolher, onArquivo }) {
  const input = useRef(null)

  return (
    <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-ink">Escolha uma foto</h2>
      <p className="mt-1 text-sm text-ink-2">Envie uma imagem do dispositivo ou use uma das suas capturas.</p>

      {aviso && (
        <p role="alert" className="mt-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{aviso}</p>
      )}

      <button
        type="button"
        onClick={() => input.current?.click()}
        className="mt-6 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-2 px-6 py-12 text-ink-2 transition hover:border-accent hover:text-accent"
      >
        <span className="text-3xl" aria-hidden="true">＋</span>
        <span className="font-semibold">Enviar foto do dispositivo</span>
        <span className="text-xs text-ink-3">JPG, PNG ou WebP</span>
      </button>
      <input ref={input} type="file" accept="image/*" onChange={onArquivo} className="hidden" aria-label="Enviar foto" />

      {fotos.length > 0 && (
        <>
          <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-ink-3">Suas capturas</h3>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {fotos.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => onEscolher(f.dataURL)}
                className="group aspect-square overflow-hidden rounded-md border border-line transition hover:border-accent focus-visible:border-accent"
                aria-label="Usar esta captura"
              >
                <img src={f.dataURL} alt="" className="h-full w-full object-cover transition group-hover:scale-105" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Editor - filho: imagem resultante com as caixas clicáveis por cima
 */
function Editor({ canvasRef, regioes, onAlternar, onMarcar, aviso }) {
  function aoClicar(evento) {
    // Clique nas caixas é tratado por elas; aqui só cliques no fundo
    if (evento.target !== evento.currentTarget) return
    const area = evento.currentTarget.getBoundingClientRect()
    onMarcar((evento.clientX - area.left) / area.width, (evento.clientY - area.top) / area.height)
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-bg">
        <canvas ref={canvasRef} className="block h-auto w-full" />
        <div
          className="absolute inset-0 cursor-crosshair"
          onClick={aoClicar}
          role="presentation"
        >
          {regioes.map((r, i) => (
            <CaixaRosto key={r.id} regiao={r} numero={i + 1} onAlternar={onAlternar} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-3">
        {aviso || 'Toque num rosto para alternar entre desfocado e nítido. Toque numa área vazia para marcar um rosto que não foi detectado.'}
      </p>
    </div>
  )
}

/**
 * CaixaRosto - filho: contorno clicável sobre cada rosto
 */
function CaixaRosto({ regiao, numero, onAlternar }) {
  const cor = regiao.borrar ? 'border-accent bg-accent/10' : 'border-warning bg-transparent'
  return (
    <button
      type="button"
      onClick={() => onAlternar(regiao.id)}
      style={{
        left: `${regiao.x * 100}%`,
        top: `${regiao.y * 100}%`,
        width: `${regiao.w * 100}%`,
        height: `${regiao.h * 100}%`
      }}
      className={`absolute rounded-[50%] border-2 transition hover:scale-105 ${cor}`}
      aria-label={`Rosto ${numero}: ${regiao.borrar ? 'desfocado, toque para mostrar' : 'nítido, toque para desfocar'}`}
      aria-pressed={regiao.borrar}
    >
      <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[10px] font-bold ${regiao.borrar ? 'bg-accent text-bg' : 'bg-warning text-bg'}`}>
        {numero}
      </span>
    </button>
  )
}

/**
 * PainelRostos - filho: lista de rostos, intensidade e ações finais
 */
function PainelRostos({
  regioes, motor, totalDesfocados, intensidade, setIntensidade, salvando, mensagem,
  onAlternar, onRemover, onTodos, onSalvar, onBaixar, onRecomecar
}) {
  const rotuloMotor = { nativo: 'detector nativo do navegador', mediapipe: 'MediaPipe' }[motor]

  return (
    <aside className="flex flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Rostos</h2>
          <span className="text-sm text-ink-2">
            <strong className="text-accent">{totalDesfocados}</strong> de {regioes.length} desfocados
          </span>
        </div>
        {rotuloMotor && <p className="mt-1 text-xs text-ink-3">Detectados com {rotuloMotor}</p>}

        {regioes.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => onTodos(true)} className="flex-1 rounded-full border border-line-2 px-3 py-1.5 text-xs font-semibold text-ink-2 transition hover:border-accent hover:text-accent">
              Desfocar todos
            </button>
            <button type="button" onClick={() => onTodos(false)} className="flex-1 rounded-full border border-line-2 px-3 py-1.5 text-xs font-semibold text-ink-2 transition hover:border-warning hover:text-warning">
              Mostrar todos
            </button>
          </div>
        )}

        <ul className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
          {regioes.length === 0 && <li className="text-sm text-ink-3">Nenhum rosto marcado ainda.</li>}
          {regioes.map((r, i) => (
            <ItemRosto key={r.id} regiao={r} numero={i + 1} onAlternar={onAlternar} onRemover={onRemover} />
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <label htmlFor="intensidade" className="flex items-baseline justify-between text-sm font-semibold text-ink">
          Intensidade do desfoque
          <span className="font-mono text-xs text-ink-2">{intensidade}/10</span>
        </label>
        <input
          id="intensidade"
          type="range"
          min="1"
          max="10"
          value={intensidade}
          onChange={e => setIntensidade(Number(e.target.value))}
          className="mt-3 w-full accent-accent"
        />
      </div>

      {mensagem && (
        <p role="status" className="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">{mensagem}</p>
      )}

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onSalvar}
          disabled={salvando}
          className="rounded-full bg-accent px-6 py-3 font-semibold text-bg transition hover:bg-accent-hi disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar na galeria'}
        </button>
        <button type="button" onClick={onBaixar} className="rounded-full border border-line-2 px-6 py-3 font-semibold text-ink transition hover:border-accent hover:text-accent">
          Baixar imagem
        </button>
        <button type="button" onClick={onRecomecar} className="py-2 text-sm text-ink-3 transition hover:text-ink">
          Escolher outra foto
        </button>
      </div>
    </aside>
  )
}

/**
 * ItemRosto - filho: linha da lista com alternância e remoção
 */
function ItemRosto({ regiao, numero, onAlternar, onRemover }) {
  return (
    <li className="flex items-center gap-3 rounded-md border border-line bg-bg-soft px-3 py-2">
      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${regiao.borrar ? 'bg-accent text-bg' : 'bg-warning text-bg'}`}>
        {numero}
      </span>
      <span className="flex-1 text-sm text-ink">
        {regiao.borrar ? 'Desfocado' : 'Nítido'}
        {regiao.origem === 'manual' && <span className="ml-1 text-xs text-ink-3">(manual)</span>}
      </span>
      <button
        type="button"
        onClick={() => onAlternar(regiao.id)}
        className="rounded-full px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-accent/10"
      >
        {regiao.borrar ? 'Mostrar' : 'Desfocar'}
      </button>
      {regiao.origem === 'manual' && (
        <button
          type="button"
          onClick={() => onRemover(regiao.id)}
          aria-label={`Remover marcação ${numero}`}
          className="rounded-full px-2 py-1 text-xs text-ink-3 transition hover:text-danger"
        >
          ✕
        </button>
      )}
    </li>
  )
}

export default Privacidade
