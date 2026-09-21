import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import styles from './Header.module.css'

/**
 * Header - Componente filho do Layout
 * Contém a navegação principal + logo
 * Usa useState local para controlar o menu mobile
 */
function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const { usuario, autenticado, sair } = useAuth()
  const navigate = useNavigate()

  const fecharMenu = () => setMenuAberto(false)

  // Com sessão: navegação do app. Sem sessão: só as rotas públicas.
  const links = autenticado
    ? [
        { to: '/painel', label: 'Painel' },
        { to: '/camera', label: 'Câmera' },
        { to: '/estuda-comigo', label: 'Estuda Comigo' },
        { to: '/resolve-aqui', label: 'Resolve Aqui' },
        { to: '/privacidade', label: 'Privacidade' },
        { to: '/galeria', label: 'Galeria' }
      ]
    : [
        { to: '/', label: 'Início', end: true },
        { to: '/sobre', label: 'Sobre' }
      ]

  function encerrarSessao() {
    fecharMenu()
    sair()
    navigate('/', { replace: true })
  }

  return (
    <header className={styles.header}>
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
