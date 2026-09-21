import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import apiLocal from './dev/api-local.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Em desenvolvimento, serve as funções de /api pelo próprio Vite.
    // Em produção quem as executa é a Vercel, como funções serverless.
    apiLocal()
  ],
  server: {
    port: 3000,
    open: true
  }
})
