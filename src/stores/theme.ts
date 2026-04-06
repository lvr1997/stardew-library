import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'spring' | 'summer' | 'autumn' | 'winter'

export interface ThemeConfig {
  name: string
  backgroundImage: string
  music?: string
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<Theme>('spring')
  const isMusicEnabled = ref(true)
  const isSoundEffectsEnabled = ref(true)
  const areSeasonEffectsEnabled = ref(true)
  const currentMusic = ref('default')
  const backgroundImages = ref<Record<Theme, string>>({
    spring: '',
    summer: '',
    autumn: '',
    winter: ''
  })

  // Preload background images
  const preloadBackgrounds = async () => {
    const themes: Theme[] = ['spring', 'summer', 'autumn', 'winter']

    await Promise.all(themes.map(async (theme) => {
      try {
        const imagePath = `/src/assets/themes/${theme}/bg.png`
        const img = new Image()
        img.src = imagePath
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = () => {
            // Fallback to default background if theme-specific doesn't exist
            backgroundImages.value[theme] = '/src/assets/bg.png'
            resolve(null)
          }
        })
        backgroundImages.value[theme] = imagePath
      } catch (error) {
        console.warn(`Failed to load background for ${theme}, using fallback`)
        backgroundImages.value[theme] = '/src/assets/bg.png'
      }
    }))
  }

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    currentTheme.value = theme
    const root = document.documentElement

    // Set theme-specific CSS variables
    root.style.setProperty('--app-bg-image', `url(${backgroundImages.value[theme]})`)

    // Add theme class for additional styling
    root.className = `theme-${theme}`

    // Save to localStorage
    localStorage.setItem('currentTheme', theme)
  }

  // Load saved theme
  const loadSavedTheme = () => {
    const saved = localStorage.getItem('currentTheme') as Theme
    if (saved && ['spring', 'summer', 'autumn', 'winter'].includes(saved)) {
      applyTheme(saved)
    }
  }

  // Load saved settings
  const loadSavedSettings = () => {
    isMusicEnabled.value = localStorage.getItem('musicEnabled') !== 'false'
    isSoundEffectsEnabled.value = localStorage.getItem('soundEffectsEnabled') !== 'false'
    areSeasonEffectsEnabled.value = localStorage.getItem('seasonEffectsEnabled') !== 'false'
    currentMusic.value = localStorage.getItem('currentMusic') || 'default'
  }

  // Save settings
  const saveSettings = () => {
    localStorage.setItem('musicEnabled', String(isMusicEnabled.value))
    localStorage.setItem('soundEffectsEnabled', String(isSoundEffectsEnabled.value))
    localStorage.setItem('seasonEffectsEnabled', String(areSeasonEffectsEnabled.value))
    localStorage.setItem('currentMusic', currentMusic.value)
  }

  // Toggle functions
  const toggleMusic = () => {
    isMusicEnabled.value = !isMusicEnabled.value
    saveSettings()
  }

  const toggleSoundEffects = () => {
    isSoundEffectsEnabled.value = !isSoundEffectsEnabled.value
    saveSettings()
  }

  const toggleSeasonEffects = () => {
    areSeasonEffectsEnabled.value = !areSeasonEffectsEnabled.value
    saveSettings()
  }

  const setMusic = (music: string) => {
    currentMusic.value = music
    saveSettings()
  }

  return {
    currentTheme,
    isMusicEnabled,
    isSoundEffectsEnabled,
    areSeasonEffectsEnabled,
    currentMusic,
    preloadBackgrounds,
    applyTheme,
    loadSavedTheme,
    loadSavedSettings,
    toggleMusic,
    toggleSoundEffects,
    toggleSeasonEffects,
    setMusic
  }
})