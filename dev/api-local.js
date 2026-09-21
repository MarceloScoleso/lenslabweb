/**
 * api-local.js
 * Plugin do Vite que executa as funções de /api durante o desenvolvimento.
 *
 * Na Vercel, cada arquivo de /api vira uma função serverless. Localmente,
 * o `npm run dev` do Vite não sabe fazer isso, então este plugin intercepta
 * as requisições para /api/*, carrega o arquivo correspondente e chama o
 * handler. O mesmo código roda nos dois ambientes, sem precisar da CLI da
 * Vercel para testar o projeto.
 */
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

export default function apiLocal() {
  const raiz = path.resolve(process.cwd(), 'api')

  const middleware = async (req, res, next) => {
    if (!req.url || !req.url.startsWith('/api/')) return next()

    const rota = req.url.split('?')[0].replace(/^\/api\//, '').replace(/\/$/, '')
    const arquivo = path.join(raiz, `${rota}.js`)

    // Impede acesso aos módulos internos e a caminhos fora de /api
    if (rota.split('/').some(parte => parte.startsWith('_') || parte === '..') ||
        !arquivo.startsWith(raiz) || !fs.existsSync(arquivo)) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      return res.end(JSON.stringify({ erro: 'Rota da API não encontrada.' }))
    }

    try {
      // O parâmetro de versão força o recarregamento após cada edição
      const modulo = await import(`${pathToFileURL(arquivo).href}?v=${Date.now()}`)
      await modulo.default(req, res)
    } catch (e) {
      console.error('[api-local]', e)
      if (!res.headersSent) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ erro: 'Erro interno na API.' }))
      }
    }
  }

  return {
    name: 'lenslab-api-local',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    }
  }
}
