/**
 * storage.js
 * Verifica se o localStorage está realmente disponível.
 *
 * Não basta checar se `window.localStorage` existe: em navegação anônima
 * restrita, com cookies bloqueados para o site, ou em iframes de terceiros,
 * o objeto existe mas qualquer escrita lança. Como o LensLab guarda tudo
 * ali, o app precisa avisar em vez de perder os dados em silêncio.
 */

const CHAVE_TESTE = '__lenslab_teste__'

export function armazenamentoDisponivel() {
  try {
    window.localStorage.setItem(CHAVE_TESTE, '1')
    window.localStorage.removeItem(CHAVE_TESTE)
    return true
  } catch {
    return false
  }
}
