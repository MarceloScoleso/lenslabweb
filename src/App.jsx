import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout.jsx'
import RotaPrivada from './components/RotaPrivada/RotaPrivada.jsx'

import Landing from './pages/Landing/Landing.jsx'
import Login from './pages/Login/Login.jsx'
import Sobre from './pages/Sobre/Sobre.jsx'
import NaoEncontrada from './pages/NaoEncontrada/NaoEncontrada.jsx'

import Home from './pages/Home/Home.jsx'
import Camera from './pages/Camera/Camera.jsx'
import EstudaComigo from './pages/EstudaComigo/EstudaComigo.jsx'
import ResolveAqui from './pages/ResolveAqui/ResolveAqui.jsx'
import Privacidade from './pages/Privacidade/Privacidade.jsx'
import Galeria from './pages/Galeria/Galeria.jsx'

/**
 * App - Mapa de rotas.
 *
 * Rotas PÚBLICAS: landing, login, sobre e 404.
 * Rotas PRIVADAS: tudo que lê ou grava dados do estudante. Ficam dentro
 * de <RotaPrivada>, que redireciona para /login quando não há sessão.
 */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Privadas */}
        <Route element={<RotaPrivada />}>
          <Route path="/painel" element={<Home />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/estuda-comigo" element={<EstudaComigo />} />
          <Route path="/resolve-aqui" element={<ResolveAqui />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/galeria" element={<Galeria />} />
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Route>
    </Routes>
  )
}

export default App
