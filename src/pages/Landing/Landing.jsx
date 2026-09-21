import { useAuth } from '../../hooks/useAuth.js'
import Hero from '../../components/landing/Hero.jsx'
import Solucao from '../../components/landing/Solucao.jsx'
import Publico from '../../components/landing/Publico.jsx'
import GaleriaDemo from '../../components/landing/GaleriaDemo.jsx'
import Equipe from '../../components/landing/Equipe.jsx'
import Contato from '../../components/landing/Contato.jsx'
import * as conteudo from '../../data/landing.js'

/**
 * Landing - Rota pública "/". É a landing page da Sprint 3 (Front-End
 * Design) integrada ao React, com as mesmas seções, textos, âncoras e
 * ordem do index.html original.
 *
 * A página em si não tem conteúdo: ela só distribui os dados de
 * src/data/landing.js para as seções filhas, por props.
 *
 * Estrutura pai -> filho:
 *   Landing (pai)
 *     |-- Hero        (#top)
 *     |-- Solucao     (#solucao)
 *     |-- Publico     (#publico)
 *     |-- GaleriaDemo (#galeria)
 *     |-- Equipe      (#equipe)
 *     |-- Contato     (#contato)
 *
 * O header e o rodapé não ficam aqui: são o Header e o Footer do Layout,
 * compartilhados com o resto do app.
 */
function Landing() {
  const { autenticado } = useAuth()

  return (
    <div id="top">
      <Hero dados={conteudo.hero} autenticado={autenticado} />
      <Solucao dados={conteudo.solucao} />
      <Publico dados={conteudo.publico} />
      <GaleriaDemo dados={conteudo.galeria} />
      <Equipe dados={conteudo.equipe} />
      <Contato dados={conteudo.contato} />
    </div>
  )
}

export default Landing
