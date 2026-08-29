import { useState, useRef, useCallback } from 'react'

/**
 * useLocalStorage - Hook customizado para persistir state no localStorage
 *
 * A gravação acontece de forma síncrona dentro do setter, e não em um
 * useEffect. Isso garante que o dado seja salvo mesmo quando o componente
 * é desmontado no mesmo evento (por exemplo: salvar o material e navegar
 * para a Galeria na mesma função).
 *
 * @param {string} key - Chave usada no localStorage
 * @param {any} initialValue - Valor inicial se não houver nada salvo
 * @returns {[value, salvar]} - Como um useState normal, mas persistente
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Erro ao ler localStorage[${key}]:`, error)
      return initialValue
    }
  })

  // Mantém o valor mais recente acessível para updates em função
  const valorAtual = useRef(value)

  const salvar = useCallback((novoValor) => {
    const resolvido = typeof novoValor === 'function'
      ? novoValor(valorAtual.current)
      : novoValor

    valorAtual.current = resolvido

    try {
      window.localStorage.setItem(key, JSON.stringify(resolvido))
    } catch (error) {
      console.warn(`Erro ao salvar localStorage[${key}]:`, error)
    }

    setValue(resolvido)
  }, [key])

  return [value, salvar]
}
