import { useCallback, useEffect, useRef, useState } from 'react'

const CAMPOS_VAZIOS = { nome: '', email: '', assunto: '', mensagem: '' }

/** E-mail "bom o suficiente": exige algo@algo.algo, sem espaços. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Valida os campos e devolve um objeto de erros por campo.
 * Fora do hook porque é função pura — mais fácil de ler e de testar.
 */
function validar(campos) {
  const erros = {}

  if (!campos.nome.trim()) erros.nome = 'Diga como podemos te chamar.'
  else if (campos.nome.trim().length < 3) erros.nome = 'Nome muito curto.'

  if (!campos.email.trim()) erros.email = 'Precisamos de um email para responder.'
  else if (!EMAIL.test(campos.email.trim())) erros.email = 'Esse email não parece válido.'

  if (!campos.assunto) erros.assunto = 'Escolha um assunto.'

  if (!campos.mensagem.trim()) erros.mensagem = 'Escreva sua mensagem.'
  else if (campos.mensagem.trim().length < 10) erros.mensagem = 'Conte um pouco mais (mín. 10 caracteres).'

  return erros
}

/**
 * useFormularioContato - substitui o trecho "FORMULÁRIO" do js/main.js.
 *
 * Guarda os campos, valida no envio, simula o POST com um atraso curto e
 * volta ao estado inicial depois de mostrar o sucesso. Não fala com
 * back-end nenhum: o formulário da landing é institucional.
 *
 * @returns {{campos, erros, situacao, enviando, enviado, aoMudar, aoEnviar}}
 */
export function useFormularioContato() {
  const [campos, setCampos] = useState(CAMPOS_VAZIOS)
  const [erros, setErros] = useState({})
  // 'parado' | 'enviando' | 'enviado'
  const [situacao, setSituacao] = useState('parado')

  // Guarda os timers para limpá-los se o componente sair da tela no meio
  const temporizadores = useRef([])

  useEffect(() => {
    const atuais = temporizadores.current
    return () => atuais.forEach(clearTimeout)
  }, [])

  const aoMudar = useCallback(event => {
    const { name, value } = event.target
    setCampos(anteriores => ({ ...anteriores, [name]: value }))
    // Some com o erro assim que o usuário começa a corrigir o campo
    setErros(anteriores => {
      if (!anteriores[name]) return anteriores
      const { [name]: _removido, ...resto } = anteriores
      return resto
    })
  }, [])

  const aoEnviar = useCallback(
    event => {
      event.preventDefault()
      if (situacao === 'enviando') return

      const encontrados = validar(campos)
      setErros(encontrados)
      if (Object.keys(encontrados).length > 0) return

      setSituacao('enviando')

      // Simula a ida ao servidor e, depois, devolve o formulário ao início
      temporizadores.current.push(
        setTimeout(() => {
          setSituacao('enviado')
          setCampos(CAMPOS_VAZIOS)

          temporizadores.current.push(
            setTimeout(() => setSituacao('parado'), 2600)
          )
        }, 800)
      )
    },
    [campos, situacao]
  )

  return {
    campos,
    erros,
    situacao,
    enviando: situacao === 'enviando',
    enviado: situacao === 'enviado',
    aoMudar,
    aoEnviar
  }
}

export default useFormularioContato
