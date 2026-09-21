import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header/Header.jsx'
import Footer from '../Footer/Footer.jsx'
import Icon from '../Icon/Icon.jsx'
import { armazenamentoDisponivel } from '../../utils/storage.js'

/**
 * Layout - Componente PAI que envolve todas as páginas
 *
 * Estrutura pai -> filho:
 *   Layout (pai)
 *     |-- Header (filho)
 *     |-- AvisoArmazenamento (filho, só quando o localStorage está bloqueado)
 *     |-- main > Outlet (renderiza a página atual como filho)
 *     |-- Footer (filho)
 */
function Layout() {
  // Testado uma vez só, na montagem: o estado do storage não muda sozinho
  const [semArmazenamento] = useState(() => !armazenamentoDisponivel())

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <main className="flex-1 pt-[var(--header-h)]">
        {semArmazenamento && <AvisoArmazenamento />}
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

/**
 * AvisoArmazenamento - filho: alerta de que nada será salvo
 */
function AvisoArmazenamento() {
  return (
    <div
      role="alert"
      className="mx-6 mt-4 flex max-w-[var(--container)] items-start gap-3 rounded-sm border border-warning/30 bg-warning/8 px-4 py-3.5 min-[1200px]:mx-auto"
    >
      <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-xs bg-warning/15 text-warning">
        <Icon nome="alerta" tamanho={17} />
      </span>
      <p className="text-sm leading-[1.55] text-ink-2">
        <strong className="font-semibold text-warning">
          O navegador está bloqueando o armazenamento deste site.
        </strong>{' '}
        Você pode usar o LensLab normalmente, mas nada será salvo ao recarregar a
        página. Saia da navegação anônima ou libere os dados de site para este endereço.
      </p>
    </div>
  )
}

export default Layout
