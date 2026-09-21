import { useEffect, useState } from 'react'

/**
 * useRolagem - substitui o trecho "HEADER SCROLL" do js/main.js da Sprint 3.
 *
 * A landing original escrevia box-shadow direto no style do header. Aqui o
 * hook só devolve se a página já passou do limite; quem decide o que fazer
 * com isso é o componente visual (o Header aplica uma classe do Tailwind).
 *
 * @param {number} limite - distância em pixels a partir da qual considera rolado
 * @returns {boolean} true quando a rolagem vertical passou do limite
 */
export function useRolagem(limite = 50) {
  const [rolou, setRolou] = useState(false)

  useEffect(() => {
    function aoRolar() {
      setRolou(window.scrollY > limite)
    }

    // Confere já na montagem: a página pode abrir com a rolagem restaurada
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [limite])

  return rolou
}

export default useRolagem
