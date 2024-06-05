import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],

    // https://vitejs.dev/guide/static-deploy.html#github-pages
    // this should be the repo name
    base: '/city-learner/'
})
