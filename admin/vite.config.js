import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0', // important for Render
    port: parseInt(process.env.PORT) || 10000, // Render sets PORT
    allowedHosts: ['quickmart-admin.onrender.com'], // your Render domain
  },
})
