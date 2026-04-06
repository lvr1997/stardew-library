import { createPinia } from 'pinia'
import 'virtual:uno.css'
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import './styles/index.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)

// Preload background images before mounting
const initApp = async () => {
  const themeStore = useThemeStore()
  await themeStore.preloadBackgrounds()
  themeStore.loadSavedTheme()
  themeStore.loadSavedSettings()

  app.mount('#app')
}

initApp()
