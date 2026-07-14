import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const appBase = process.env.APP_BASE || '/ra-mat-web-2026/'

export default defineConfig({
  base: appBase,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174
  }
})
