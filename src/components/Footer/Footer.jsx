import styles from './Footer.module.css'

/**
 * Footer - Componente filho do Layout
 */
function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <img src="/assets/lenslab.webp" alt="LensLab" className={styles.logoImg} />
          <span className={styles.divisor} aria-hidden="true"></span>
          <p className={styles.tagline}>A câmera que ensina.</p>
        </div>

        <p className={styles.copy}>
          © {ano} Equipe LensLab — FIAP · JOVI Smartphone
        </p>
      </div>
    </footer>
  )
}

export default Footer
