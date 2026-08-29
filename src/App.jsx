import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import Home from './pages/Home/Home.jsx'
import Camera from './pages/Camera/Camera.jsx'
import Galeria from './pages/Galeria/Galeria.jsx'
import EstudaComigo from './pages/EstudaComigo/EstudaComigo.jsx'
import ResolveAqui from './pages/ResolveAqui/ResolveAqui.jsx'
import Sobre from './pages/Sobre/Sobre.jsx'

/**
 * App - Componente raiz que define as rotas do aplicativo
 * Todas as rotas passam pelo Layout (pai) que envolve Header + main + Footer
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="camera" element={<Camera />} />
        <Route path="galeria" element={<Galeria />} />
        <Route path="estuda-comigo" element={<EstudaComigo />} />
        <Route path="resolve-aqui" element={<ResolveAqui />} />
        <Route path="sobre" element={<Sobre />} />
      </Route>
    </Routes>
  )
}

export default App
