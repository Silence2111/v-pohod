import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLEFILE=1 → собирает всё в один автономный index.html (offline, удобно
// скинуть судье или залить одним файлом). Обычная сборка — base './' для
// любого статического хостинга (GitHub Pages / Netlify).
const single = process.env.SINGLEFILE === '1'

export default defineConfig({
  plugins: [react(), ...(single ? [viteSingleFile()] : [])],
  base: './',
  build: single ? { outDir: 'dist-single' } : {},
})
