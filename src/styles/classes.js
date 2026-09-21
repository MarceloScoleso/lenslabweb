/**
 * classes.js - Conjuntos de utilitários do Tailwind que se repetem no app.
 *
 * Substituem as classes .container, .btn e variantes que viviam no
 * global.css. Continuam sendo utilitários do Tailwind, só que reunidos
 * num lugar só para não repetir a mesma sequência em cada página.
 */

/** Faixa central de conteúdo, do mesmo tamanho em todas as páginas. */
export const CONTAINER = 'mx-auto w-full max-w-[var(--container)] px-[var(--gutter)]'

/** Base de todo botão: forma, tipografia e tamanho dos ícones. */
export const BTN =
  'inline-flex cursor-pointer items-center justify-center gap-[0.55rem] whitespace-nowrap rounded-sm border border-transparent px-[1.35rem] py-3 text-[0.925rem] font-semibold leading-[1.2] tracking-[-0.01em] transition disabled:cursor-not-allowed disabled:opacity-40 [&>svg]:h-[17px] [&>svg]:w-[17px]'

export const BTN_PRIMARIO = `${BTN} bg-accent text-bg shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] disabled:shadow-none enabled:hover:bg-accent-hi enabled:hover:-translate-y-px enabled:hover:shadow-[0_8px_24px_-8px_rgba(0,200,150,0.55)] enabled:active:translate-y-0`

export const BTN_SECUNDARIO = `${BTN} border-line-2 bg-white/[0.03] text-ink enabled:hover:border-accent/40 enabled:hover:bg-white/[0.06]`

export const BTN_FANTASMA = `${BTN} bg-transparent text-ink-2 enabled:hover:bg-white/[0.04] enabled:hover:text-ink`

export const BTN_PERIGO = `${BTN} border-danger/25 bg-danger/12 text-danger enabled:hover:bg-danger/20`
