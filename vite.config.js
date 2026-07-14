import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleLeadApi, sendJson } from './leadApi.mjs'

const leadApiPlugin = () => ({
  name: 'stocktraders-lead-api',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      try {
        const handled = await handleLeadApi(req, res)
        if (!handled) next()
      } catch (err) {
        console.error(err)
        sendJson(res, 500, { error: err.message || 'Lỗi server' })
      }
    })
  }
})

export default defineConfig({
  plugins: [leadApiPlugin(), react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['landing.stocktradersai.vn']
  }
})
