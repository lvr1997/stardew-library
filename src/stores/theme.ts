import { useLocalStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type Theme = 'spring' | 'summer' | 'autumn' | 'winter'
export type AppFont = 'fusion-pixel' | 'KNMaiyuan'

export interface AppSettings {
  theme: Theme
  language: 'zh' | 'en'
  font: AppFont
  musicEnabled: boolean
  soundEffectsEnabled: boolean
  seasonEffectsEnabled: boolean
  title: string
  description: string
}

export interface ThemeConfig {
  name: string
  backgroundImage: string
  music?: string
}

const defaultSettings: AppSettings = {
  theme: 'spring',
  language: 'zh',
  font: 'fusion-pixel',
  musicEnabled: true,
  soundEffectsEnabled: true,
  seasonEffectsEnabled: true,
  title: 'Stardew Library',
  description: 'Welcome to your personal study space'
}

export const useThemeStore = defineStore('theme', () => {
  // Use useLocalStorage for automatic sync
  const settings = useLocalStorage<AppSettings>('userSettings', defaultSettings)

  // Computed refs for easy access
  const currentTheme = computed({
    get: () => settings.value.theme,
    set: (val: Theme) => { settings.value.theme = val }
  })
  const isMusicEnabled = computed({
    get: () => settings.value.musicEnabled,
    set: (val: boolean) => { settings.value.musicEnabled = val }
  })
  const isSoundEffectsEnabled = computed({
    get: () => settings.value.soundEffectsEnabled,
    set: (val: boolean) => { settings.value.soundEffectsEnabled = val }
  })
  const areSeasonEffectsEnabled = computed({
    get: () => settings.value.seasonEffectsEnabled,
    set: (val: boolean) => { settings.value.seasonEffectsEnabled = val }
  })
  const currentLanguage = computed({
    get: () => settings.value.language,
    set: (val: 'zh' | 'en') => { settings.value.language = val }
  })
  const currentFont = computed({
    get: () => settings.value.font,
    set: (val: AppFont) => { settings.value.font = val }
  })
  const title = computed({
    get: () => settings.value.title,
    set: (val: string) => { settings.value.title = val }
  })
  const description = computed({
    get: () => settings.value.description,
    set: (val: string) => { settings.value.description = val }
  })
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
    // useLocalStorage auto-saves
  }

  const applyFont = (font: AppFont) => {
    currentFont.value = font
    const root = document.documentElement
    const fontFamily = font === 'fusion-pixel' ? "'Pixel'" : "'KNMaiyuan'"
    root.style.setProperty('--app-font-family', fontFamily)
  }

  // Set language
  const setLanguage = (lang: 'zh' | 'en') => {
    currentLanguage.value = lang
    // useLocalStorage auto-saves
  }

  const setFont = (font: AppFont) => {
    applyFont(font)
  }

  // Load saved settings - useLocalStorage handles this automatically
  const loadSavedSettings = () => {
    settings.value = {
      ...defaultSettings,
      ...settings.value,
    }

    // No-op: useLocalStorage loads automatically on first access
    // Just apply the theme and font to DOM
    applyTheme(currentTheme.value)
    applyFont(currentFont.value)
  }

  // Manual save - useLocalStorage auto-saves, but expose for compatibility
  const saveSettings = () => {
    // useLocalStorage auto-saves on every change
  }

  // Update title
  const updateTitle = (value: string) => {
    title.value = value
    // useLocalStorage auto-saves
  }

  // Update description
  const updateDescription = (value: string) => {
    description.value = value
    // useLocalStorage auto-saves
  }

  // Toggle functions
  const toggleMusic = () => {
    isMusicEnabled.value = !isMusicEnabled.value
    // useLocalStorage auto-saves
  }

  const toggleSoundEffects = () => {
    isSoundEffectsEnabled.value = !isSoundEffectsEnabled.value
    // useLocalStorage auto-saves
  }

  const toggleSeasonEffects = () => {
    areSeasonEffectsEnabled.value = !areSeasonEffectsEnabled.value
    // useLocalStorage auto-saves
  }

  return {
    currentTheme,
    currentLanguage,
    currentFont,
    isMusicEnabled,
    isSoundEffectsEnabled,
    areSeasonEffectsEnabled,
    title,
    description,
    preloadBackgrounds,
    applyTheme,
    applyFont,
    setLanguage,
    setFont,
    loadSavedSettings,
    saveSettings,
    updateTitle,
    updateDescription,
    toggleMusic,
    toggleSoundEffects,
    toggleSeasonEffects
  }
})
