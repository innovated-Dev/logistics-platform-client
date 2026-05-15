// client/vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
    // Development server configuration
    server: {
        port: 3001,
        open: true, // Automatically open browser
        proxy: {
            '/api': {
                target: 'http://localhost:4000', // Your local Node.js Server
                changeOrigin: true,
                secure: false
            }
        }
    },

    // Build configuration
    build: {
        outDir: 'dist', // ✅ Changed for Render deployment
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: './index.html'
            }
        },
        sourcemap: true,
        minify: 'terser'
    },

    preview: {
        port: 3001
    },

    // Base public path when served in production
    base: './',

    // Plugin configuration
    plugins: [
        // Add plugins here if needed
    ]
})