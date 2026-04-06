<script lang="ts" setup>
import CheckBox from '@/components/common/CheckBox.vue';
import Listbox from '@/components/common/Listbox.vue';
import Popover from '@/components/common/Popover.vue';
import { availableLocales, localeLabels } from '@/i18n';
import { useSessionStore } from '@/stores/session';
import { useThemeStore, type Theme } from '@/stores/theme';
import { useTodoStore } from '@/stores/todolist';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const sessionStore = useSessionStore()
const todoStore = useTodoStore()
const themeStore = useThemeStore()
const { locale } = useI18n()

const title = ref('Stardew Library')
const description = ref('Welcome to your personal study space')
const isFullscreenEnabled = ref(false)

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
  languageOptions.find((option) => option.id === `lang-${locale.value}`) ?? languageOptions[0]
)

watch(selectedLanguage, (next) => {
  const code = next?.id?.replace('lang-', '')
  if (code && code !== locale.value) {
    locale.value = code
  }
})

watch(selectedTheme, (next) => {
  if (next) {
    const theme = next.id.replace('theme-', '') as Theme
    themeStore.applyTheme(theme)
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

onMounted(() => {
  // Load data from localStorage on app startup
  sessionStore.loadSession()
  todoStore.loadTodos()
  todoStore.loadGroups()

  // Initialize theme
  const savedTheme = localStorage.getItem('currentTheme') as Theme
  if (savedTheme) {
    const themeOption = themeOptions.find(t => t.id === `theme-${savedTheme}`)
    if (themeOption) {
      selectedTheme.value = themeOption
    }
  }

  // Initialize fullscreen state
  updateFullscreenState()

  // Listen for fullscreen change events
  document.addEventListener('fullscreenchange', updateFullscreenState)
})
</script>

<template>
  <div class="h-screen lang-zh">
    <!-- Header -->
    <div class="flex justify-around items-center">
      <!-- Title -->
      <div class="py-4">
        <h1 class="text-3xl font-bold text-primary">{{ title }}</h1>
        <p class="text-gray-500 my-2">{{ description }}</p>
      </div>

      <!-- Entry Buttons -->
      <div class="flex">
        <!-- Settings Popover -->
        <Popover>
          <div class="p-6 space-y-6 text-[#5e2c2a]">
            <div>
              <p class="text-sm mb-2">{{ $t('settings.titleLabel') }}</p>
              <input class="py-1 pl-3 pr-10 input" v-model="title" />
            </div>

            <div>
              <p class="text-sm mb-2">{{ $t('settings.descriptionLabel') }}</p>
              <input class="py-1 pl-3 pr-10 input" v-model="description" />
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
        </Popover>
      </div>
    </div>

    <!-- Main Panel -->
    <div class="flex px-6">
      <!-- <Calendar /> -->
      <!-- <Pomodoro /> -->
      <!-- <TodoPanel /> -->
    </div>

  </div>
</template>
