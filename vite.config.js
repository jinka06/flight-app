import {defineConfig} from "vite"

export default defineConfig({
	base: "/flight-app/",
	test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
})