import { useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useRolagem } from '../../hooks/useRolagem.js'
import { ancoras } from '../../data/landing.js'
import styles from './Header.module.css'

/**
 * Header - Componente filho do Layout
 * Contém a navegação principal + logo
 * Usa useState local para controlar o menu mobile
 *
 * A navegação tem três formas:
 *   - com sessão: as rotas do app
 *   - sem sessão, na landing ("/"): as âncoras das seções da landing
 *   - sem sessão, fora da landing: só as rotas públicas
 */
function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { usuario, autenticado, sair } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Sombra ao rolar, como no js/main.js da landing da Sprint 3
  const rolou = useRolagem()

  const naLanding = !autenticado && location.pathname === '/'

  const fecharMenu = () => setMenuAberto(false)

  let links
  if (autenticado) {
    links = [
      { to: '/painel', label: 'Painel' },
      { to: '/camera', label: 'Câmera' },
      { to: '/estuda-comigo', label: 'Estuda Comigo' },
      { to: '/resolve-aqui', label: 'Resolve Aqui' },
      { to: '/privacidade', label: 'Privacidade' },
      { to: '/galeria', label: 'Galeria' }
    ]
  } else if (naLanding) {
    // As seções da landing viram âncoras; o scroll suave é do CSS
    links = ancoras.map(ancora => ({ href: ancora.href, label: ancora.label }))
  } else {
    links = [
      { to: '/', label: 'Início', end: true },
      { to: '/sobre', label: 'Sobre' }
    ]
  }

  function encerrarSessao() {
    fecharMenu()
    sair()
    navigate('/', { replace: true })
  }

  return (
    <header className={`${styles.header} ${rolou ? 'shadow-card' : ''}`}>
      <div className={styles.container}>
        <Link to={autenticado ? '/painel' : '/'} className={styles.logo} onClick={fecharMenu}>
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
            {links.map(link =>
              link.href ? (
                <li key={link.href}>
                  <a href={link.href} onClick={fecharMenu}>
                    {link.label}
                  </a>
                </li>
              ) : (
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
              )
            )}
            <li className="mt-2 md:mt-0 md:ml-2">
              {autenticado ? (
                <button
                  type="button"
                  onClick={encerrarSessao}
                  title={`Conectado como ${usuario.nome}`}
                  className="w-full rounded-full border border-line-2 px-4 py-1.5 text-sm font-medium text-ink-2 transition hover:border-danger/50 hover:text-danger md:w-auto"
                >
                  Sair
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={fecharMenu}
                  className="block rounded-full bg-accent px-4 py-1.5 text-center text-sm font-semibold text-bg transition hover:bg-accent-hi"
                >
                  Entrar
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
