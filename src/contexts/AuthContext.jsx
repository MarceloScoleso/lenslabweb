import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { api, lerSessao, gravarSessao } from '../services/api.js'

/**
 * AuthContext - Estado global de autenticação.
 *
 * Ao carregar a aplicação, se existir uma sessão salva no navegador, ela é
 * validada na API (/api/auth/me) antes de liberar as rotas privadas. Assim
 * um token expirado ou adulterado não dá acesso a nada.
 */
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => lerSessao()?.usuario || null)
  const [verificando, setVerificando] = useState(() => Boolean(lerSessao()?.token))

  const sair = useCallback(() => {
    gravarSessao(null)
    setUsuario(null)
  }, [])

  // Revalida a sessão salva ao abrir o app
  useEffect(() => {
    if (!lerSessao()?.token) return

    const controlador = new AbortController()
    api.eu(controlador.signal)
      .then(({ usuario }) => {
        setUsuario(usuario)
        gravarSessao({ ...lerSessao(), usuario })
      })
      .catch(e => {
        if (e.status === 401) sair()
        // Sem conexão: mantém o usuário salvo, para o app abrir offline
      })
      .finally(() => setVerificando(false))

    return () => controlador.abort()
  }, [sair])

  // A API avisa quando uma chamada volta 401 no meio do uso
  useEffect(() => {
    window.addEventListener('lenslab:sessao-expirada', sair)
    return () => window.removeEventListener('lenslab:sessao-expirada', sair)
  }, [sair])

  const entrar = useCallback(async (email, senha) => {
    const { token, usuario } = await api.login(email, senha)
    gravarSessao({ token, usuario })
    setUsuario(usuario)
    return usuario
  }, [])

  const valor = useMemo(
    () => ({ usuario, autenticado: Boolean(usuario), verificando, entrar, sair }),
    [usuario, verificando, entrar, sair]
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
