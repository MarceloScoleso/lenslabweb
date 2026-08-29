import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import styles from './Header.module.css'

/**
 * Header - Componente filho do Layout
 * Contém a navegação principal + logo
 * Usa useState local para controlar o menu mobile
 */
function Header() {
  const [menuAberto, setMenuAberto] = useState(false)

  const fecharMenu = () => setMenuAberto(false)

  const links = [
    { to: '/', label: 'Início', end: true },
    { to: '/camera', label: 'Câmera' },
    { to: '/estuda-comigo', label: 'Estuda Comigo' },
    { to: '/resolve-aqui', label: 'Resolve Aqui' },
    { to: '/galeria', label: 'Galeria' },
    { to: '/sobre', label: 'Sobre' }
  ]

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo} onClick={fecharMenu}>
          <img src="/assets/lenslab.webp" alt="LensLab" className={styles.logoImg} />
        </Link>

        <button
          className={`${styles.menuToggle} ${menuAberto ? styles.active : ''}`}
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`${styles.nav} ${menuAberto ? styles.navOpen : ''}`}>
          <ul>
            {links.map(link => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? styles.active : '')}
                  onClick={fecharMenu}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
