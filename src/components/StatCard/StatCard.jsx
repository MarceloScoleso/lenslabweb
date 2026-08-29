import Icon from '../Icon/Icon.jsx'
import styles from './StatCard.module.css'

/**
 * StatCard - Componente FILHO reutilizável para exibir uma estatística
 *
 * Recebe props do PAI (Home ou Galeria):
 *   - icone: nome do ícone SVG (ver Icon.jsx)
 *   - titulo: label da estatística
 *   - valor: número principal a destacar
 *   - descricao: texto explicativo abaixo
 *   - cor: variante visual (primary, info, success, warning)
 */
function StatCard({ icone, titulo, valor, descricao, cor = 'primary' }) {
  return (
    <div className={`${styles.card} ${styles[cor]}`}>
      <div className={styles.topo}>
        <span className={styles.titulo}>{titulo}</span>
        <span className={styles.icone}>
          <Icon nome={icone} tamanho={16} />
        </span>
      </div>
      <strong className={styles.valor}>{valor}</strong>
      <span className={styles.descricao}>{descricao}</span>
    </div>
  )
}

export default StatCard
