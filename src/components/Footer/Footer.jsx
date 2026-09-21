/**
 * Footer - Componente filho do Layout
 */
function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="border-t border-line bg-bg-soft py-10">
      <div className="mx-auto flex max-w-[var(--container)] flex-col flex-wrap items-center gap-8 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3.5">
          <img src="/assets/lenslab.webp" alt="LensLab" className="h-6 w-auto opacity-90" />
          <span aria-hidden="true" className="h-[22px] w-px bg-line-2" />
          <p className="text-sm text-ink-2">A câmera que ensina.</p>
        </div>

        <p className="font-mono text-xs tracking-[-0.01em] text-ink-3 sm:text-[0.8125rem]">
          © {ano} Equipe LensLab — FIAP · JOVI Smartphone
        </p>
      </div>
    </footer>
  )
}

export default Footer
