import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * useLogin - Lógica do formulário de login, separada da tela.
 * Valida os campos, chama a API e redireciona para a rota de origem.
 */
export function useLogin() {
  const { entrar } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const destino = location.state?.de || '/painel'

  async function enviar(evento) {
    evento?.preventDefault()
    setErro('')

    if (!EMAIL_VALIDO.test(email.trim())) return setErro('Digite um e-mail válido.')
    if (senha.length < 4) return setErro('A senha precisa ter pelo menos 4 caracteres.')

    setEnviando(true)
    try {
      await entrar(email, senha)
      navigate(destino, { replace: true })
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  /** Preenche os dados do usuário de teste, para facilitar a avaliação */
  function preencherDemo() {
    setEmail('estudante@lenslab.com')
    setSenha('lenslab123')
    setErro('')
  }

  return { email, setEmail, senha, setSenha, erro, enviando, enviar, preencherDemo }
}
