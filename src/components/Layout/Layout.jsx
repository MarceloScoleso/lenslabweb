import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../Header/Header.jsx'
import Footer from '../Footer/Footer.jsx'
import Icon from '../Icon/Icon.jsx'
import { armazenamentoDisponivel } from '../../utils/storage.js'
import styles from './Layout.module.css'

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
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
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
    <div className={styles.aviso} role="alert">
      <span className={styles.avisoIcone}>
        <Icon nome="alerta" tamanho={17} />
      </span>
      <p>
        <strong>O navegador está bloqueando o armazenamento deste site.</strong>{' '}
        Você pode usar o LensLab normalmente, mas nada será salvo ao recarregar a
        página. Saia da navegação anônima ou libere os dados de site para este endereço.
      </p>
    </div>
  )
}

export default Layout
