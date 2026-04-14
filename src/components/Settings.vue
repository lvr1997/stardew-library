<script lang="ts" setup>
import CheckBox from '@/components/common/CheckBox.vue';
import Listbox from '@/components/common/Listbox.vue';
import { availableLocales, localeLabels } from '@/i18n';
import { useThemeStore, type AppFont, type Theme } from '@/stores/theme';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Settings component - manages user preferences stored in userSettings

const themeStore = useThemeStore()
const { locale } = useI18n()

const isFullscreenEnabled = ref(false)

// Initialize settings from store
themeStore.loadSavedSettings()

// Sync i18n locale with store
locale.value = themeStore.currentLanguage

const themeOptions = [
  { id: 'theme-spring', name: 'Spring', unavailable: false },
  { id: 'theme-summer', name: 'Summer', unavailable: false },
  { id: 'theme-autumn', name: 'Autumn', unavailable: false },
  { id: 'theme-winter', name: 'Winter', unavailable: false },
]
const selectedTheme = ref(themeOptions[0])

const languageOptions = availableLocales.map((code) => ({
  id: `lang-${code}`,
  name: localeLabels[code],
  unavailable: false,
}))
const selectedLanguage = ref(
  languageOptions.find((option) => option.id === `lang-${themeStore.currentLanguage}`) ?? languageOptions[0]
)
const fontOptions = [
  { id: 'font-fusion-pixel', name: 'fusion-pixel', unavailable: false },
  { id: 'font-KNMaiyuan', name: 'KNMaiyuan', unavailable: false },
]
const selectedFont = ref(
  fontOptions.find((option) => option.id === `font-${themeStore.currentFont}`) ?? fontOptions[0]
)

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('currentTheme') as Theme
if (savedTheme) {
  const themeOption = themeOptions.find(t => t.id === `theme-${savedTheme}`)
  if (themeOption) {
    selectedTheme.value = themeOption
  }
}

watch(selectedLanguage, (next) => {
  const code = next?.id?.replace('lang-', '') as 'zh' | 'en'
  if (code && code !== locale.value) {
    locale.value = code
    themeStore.setLanguage(code)
  }
})

watch(selectedTheme, (next) => {
  if (next) {
    const theme = next.id.replace('theme-', '') as Theme
    themeStore.applyTheme(theme)
  }
})

watch(selectedFont, (next) => {
  const font = next?.id?.replace('font-', '') as AppFont
  if (font && font !== themeStore.currentFont) {
    themeStore.setFont(font)
  }
})

const toggleFullscreen = async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
}

const updateFullscreenState = () => {
  isFullscreenEnabled.value = !!document.fullscreenElement
}

// Initialize fullscreen state
updateFullscreenState()

// Listen for fullscreen change events
document.addEventListener('fullscreenchange', updateFullscreenState)
</script>

<template>
  <div class="p-6 space-y-6 text-[#5e2c2a]">
    <div>
      <p class="text-sm mb-2">{{ $t('settings.titleLabel') }}</p>
      <input
        class="py-1 pl-3 pr-10 input-base"
        v-model="themeStore.title"
      />
    </div>

    <div>
      <p class="text-sm mb-2">{{ $t('settings.descriptionLabel') }}</p>
      <textarea
        class="py-1 pl-3 pr-10 input-base resize-none"
        v-model="themeStore.description"
        rows="3"
      />
    </div>

    <!-- Toggle Controls -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <p class="text-sm">{{ $t('settings.theme') }}</p>
        <Listbox v-model="selectedTheme" :options="themeOptions" />
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm">{{ $t('settings.language') }}</p>
        <Listbox v-model="selectedLanguage" :options="languageOptions" />
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm">{{ $t('settings.font') }}</p>
        <Listbox v-model="selectedFont" :options="fontOptions" />
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm">{{ $t('settings.music') }}</p>
        <CheckBox v-model="themeStore.isMusicEnabled" />
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm">{{ $t('settings.soundEffects') }}</p>
        <CheckBox v-model="themeStore.isSoundEffectsEnabled" />
      </div>

      <div class="flex items-center justify-between">
        <p class="text-sm">{{ $t('settings.seasonEffects') }}</p>
        <CheckBox v-model="themeStore.areSeasonEffectsEnabled" />
      </div>

      <div class="flex items-center justify-between">
        <button
          @click="toggleFullscreen"
          class="btn"
          :aria-pressed="isFullscreenEnabled"
        >
          {{ isFullscreenEnabled ? $t('settings.exitFullscreen') : $t('settings.fullscreen') }}
        </button>
      </div>
    </div>
  </div>
</template>
