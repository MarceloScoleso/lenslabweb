import { useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useRolagem } from '../../hooks/useRolagem.js'
import { ancoras } from '../../data/landing.js'

/** Estilo comum a todos os itens de navegação, em barra ou em gaveta. */
const LINK =
  'block rounded-xs px-3 py-[0.45rem] text-sm font-medium transition max-nav:rounded-sm max-nav:px-4 max-nav:py-3 max-nav:text-[0.95rem]'
const LINK_NORMAL = 'text-ink-3 hover:bg-white/5 hover:text-ink'
const LINK_ATIVO = 'bg-accent/12 text-accent'

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
    <header
      className={`fixed inset-x-0 top-0 z-[100] flex h-[var(--header-h)] items-center border-b border-line transition-shadow ${
        rolou ? 'shadow-card' : ''
      }`}
    >
      {/*
        O blur fica nesta camada, e não no <header>.
        backdrop-filter cria um containing block para descendentes
        position:fixed — com ele no header, a gaveta do menu ficava presa
        dentro da faixa de 64px em vez de cobrir a tela inteira.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-bg/70 backdrop-blur-[16px] backdrop-saturate-150"
      />

      <div className="relative mx-auto flex w-full max-w-[var(--container)] items-center justify-between gap-8 px-6">
        <Link
          to={autenticado ? '/painel' : '/'}
          className="flex shrink-0 items-center gap-2.5"
          onClick={fecharMenu}
        >
          <img src="/assets/lenslab.webp" alt="LensLab" className="h-7 w-auto" />
        </Link>

        <button
          className="z-[101] flex h-[38px] w-[38px] flex-col items-center justify-center gap-[5px] rounded-xs border border-line transition-colors hover:border-line-2 nav:hidden"
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
        >
          <span
            className={`block h-[1.5px] w-4 rounded-[2px] bg-ink transition-transform ${
              menuAberto ? 'translate-y-[6.5px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-[1.5px] w-4 rounded-[2px] bg-ink transition-opacity ${
              menuAberto ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-[1.5px] w-4 rounded-[2px] bg-ink transition-transform ${
              menuAberto ? '-translate-y-[6.5px] -rotate-45' : ''
            }`}
          />
        </button>

        <nav
          className={`transition-transform max-nav:fixed max-nav:inset-y-0 max-nav:right-0 max-nav:w-full max-nav:max-w-[300px] max-nav:border-l max-nav:border-line max-nav:bg-bg-soft max-nav:px-4 max-nav:pb-8 max-nav:pt-[calc(var(--header-h)_+_1.25rem)] max-nav:shadow-card ${
            menuAberto ? 'max-nav:translate-x-0' : 'max-nav:translate-x-[101%]'
          }`}
        >
          <ul className="flex items-center gap-[0.15rem] max-nav:flex-col max-nav:items-stretch max-nav:gap-1">
            {links.map(link =>
              link.href ? (
                <li key={link.href}>
                  <a href={link.href} onClick={fecharMenu} className={`${LINK} ${LINK_NORMAL}`}>
                    {link.label}
                  </a>
                </li>
              ) : (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `${LINK} ${isActive ? LINK_ATIVO : LINK_NORMAL}`
                    }
                    onClick={fecharMenu}
                  >
                    {link.label}
                  </NavLink>
                </li>
              )
            )}
            <li className="max-nav:mt-2 nav:ml-2">
              {autenticado ? (
                <button
                  type="button"
                  onClick={encerrarSessao}
                  title={`Conectado como ${usuario.nome}`}
                  className="w-full rounded-full border border-line-2 px-4 py-1.5 text-sm font-medium text-ink-2 transition hover:border-danger/50 hover:text-danger nav:w-auto"
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
