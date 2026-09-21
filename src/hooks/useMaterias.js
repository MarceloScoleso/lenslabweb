import { useState, useEffect } from 'react'
import { api } from '../services/api.js'

// Usada só se a API estiver fora do ar, para a tela continuar utilizável
const RESERVA = {
  estuda: ['Matemática', 'Física', 'Química', 'Biologia', 'História', 'Português'],
  resolve: ['Matemática', 'Física', 'Química', 'Biologia']
}

/**
 * useMaterias - Lista de matérias disponíveis em um modo, vinda da API.
 * @param {'estuda' | 'resolve'} modo
 */
export function useMaterias(modo) {
  const [materias, setMaterias] = useState(RESERVA[modo] || [])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const controlador = new AbortController()

    api.materias(controlador.signal)
      .then(({ materias }) => {
        setMaterias(materias.filter(m => m.modos.includes(modo)).map(m => m.nome))
        setErro(null)
      })
      .catch(e => {
        if (!controlador.signal.aborted) setErro(e.message)
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCarregando(false)
      })

    return () => controlador.abort()
  }, [modo])

  return { materias, carregando, erro }
}
