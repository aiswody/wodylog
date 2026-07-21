import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // fixed so Google OAuth's registered origin (http://localhost:5173)
    // always matches. strictPort errors out loudly if 5173 is taken
    // instead of silently sliding to 5174 and breaking the OAuth origin.
    port: 5173,
    strictPort: true,
  },
})
