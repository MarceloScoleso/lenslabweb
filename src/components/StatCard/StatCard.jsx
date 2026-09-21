import Icon from '../Icon/Icon.jsx'

/**
 * Cada variante define o tom do filete do topo e do quadrado do ícone.
 * Antes isso era a variável --tom no CSS Module; agora são classes do tema.
 */
const TONS = {
  primary: { filete: 'bg-accent', icone: 'bg-accent/12 text-accent' },
  info: { filete: 'bg-info', icone: 'bg-info/12 text-info' },
  success: { filete: 'bg-accent-hi', icone: 'bg-accent-hi/12 text-accent-hi' },
  warning: { filete: 'bg-warning', icone: 'bg-warning/12 text-warning' }
}

/**
 * StatCard - Componente FILHO reutilizável para exibir uma estatística
 *
 * Recebe props do PAI (Home ou Galeria):
 *   - icone: nome do ícone SVG (ver Icon.jsx)
 *   - titulo: label da estatística
 *   - valor: número principal a destacar
 *   - descricao: texto explicativo abaixo
 *   - cor: variante visual (primary, info, success, warning)
 */
function StatCard({ icone, titulo, valor, descricao, cor = 'primary' }) {
  const tom = TONS[cor] ?? TONS.primary

  return (
    <div className="group relative flex flex-col gap-[0.15rem] overflow-hidden rounded-md border border-line bg-surface px-5 pb-5 pt-[1.15rem] transition hover:-translate-y-0.5 hover:border-line-2 hover:bg-surface-2">
      {/* Filete de cor no topo, revelado no hover */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-px opacity-40 transition-opacity group-hover:opacity-100 ${tom.filete}`}
      />

      <div className="mb-[0.65rem] flex items-center justify-between gap-3">
        <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-ink-3">
          {titulo}
        </span>
        <span className={`grid h-7 w-7 place-items-center rounded-xs ${tom.icone}`}>
          <Icon nome={icone} tamanho={16} />
        </span>
      </div>

      <strong className="text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-ink tabular-nums">
        {valor}
      </strong>
      <span className="mt-[0.2rem] text-[0.8125rem] text-ink-3">{descricao}</span>
    </div>
  )
}

export default StatCard
