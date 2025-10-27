import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployment-specific Vite config without TypeScript checking
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',  // Use esbuild instead of terser
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  },
  esbuild: {
    // Skip TypeScript checking in esbuild
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})