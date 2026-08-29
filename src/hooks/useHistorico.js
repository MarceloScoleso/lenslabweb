import { useLocalStorage } from './useLocalStorage.js'
import { gerarId } from '../utils/math-utils.js'

/**
 * useHistorico - Registro das ações do usuário sobre o conteúdo.
 *
 * Atende ao exemplo do professor: "Histórico e estatísticas: registro
 * do que foi adicionado, editado ou removido".
 */
export function useHistorico() {
  const [historico, setHistorico] = useLocalStorage('lenslab_historico', [])

  function registrar(acao, descricao) {
    const evento = {
      id: gerarId('evento'),
      acao, // 'criado' | 'removido' | 'restaurado' | 'excluido'
      descricao,
      timestamp: Date.now()
    }
    // Mantém os 50 eventos mais recentes
    setHistorico([evento, ...historico].slice(0, 50))
  }

  return { historico, registrar }
}
