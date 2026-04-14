<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import CheckBox from '@/components/common/CheckBox.vue';
import { useThemeStore } from '@/stores/theme';
import { useTitle } from '@vueuse/core';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

type PomodoroMode = 'focus' | 'short' | 'long'

interface PomodoroSettings {
  focusMinutes: number
  shortMinutes: number
  longMinutes: number
  cyclesBeforeLong: number
  autoSwitch: boolean
  soundEnabled: boolean
}

interface PomodoroState {
  mode: PomodoroMode
  remainingMs: number
  isRunning: boolean
  cycleCount: number
  settings: PomodoroSettings
}

const STORAGE_KEY = 'pomodoroState'

const settings = ref<PomodoroSettings>({
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  cyclesBeforeLong: 4,
  autoSwitch: true,
  soundEnabled: true
})

const mode = ref<PomodoroMode>('focus')
const remainingMs = ref(25 * 60 * 1000)
const isRunning = ref(false)
const cycleCount = ref(0)
const { t } = useI18n()
const themeStore = useThemeStore()

let intervalId: number | null = null
let lastTick = 0
let audioContext: AudioContext | null = null

/**
 * Get the duration in milliseconds for a given mode.
 */
const getDurationMs = (targetMode: PomodoroMode): number => {
  const minutes = targetMode === 'focus'
    ? settings.value.focusMinutes
    : targetMode === 'short'
      ? settings.value.shortMinutes
      : settings.value.longMinutes
  return Math.max(1, minutes) * 60 * 1000
}

/**
 * Format milliseconds to a time string.
 */
const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

/**
 * Persist current state into localStorage.
 */
const saveState = () => {
  const payload: PomodoroState = {
    mode: mode.value,
    remainingMs: remainingMs.value,
    isRunning: isRunning.value,
    cycleCount: cycleCount.value,
    settings: settings.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

/**
 * Load state from localStorage.
 */
const loadState = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return
  try {
    const parsed = JSON.parse(stored) as PomodoroState
    mode.value = parsed.mode || 'focus'
    remainingMs.value = parsed.remainingMs || getDurationMs(parsed.mode || 'focus')
    isRunning.value = false
    cycleCount.value = Number.isFinite(parsed.cycleCount) ? Math.max(0, parsed.cycleCount) : 0
    settings.value = {
      focusMinutes: parsed.settings?.focusMinutes ?? 25,
      shortMinutes: parsed.settings?.shortMinutes ?? 5,
      longMinutes: parsed.settings?.longMinutes ?? 15,
      cyclesBeforeLong: parsed.settings?.cyclesBeforeLong ?? 4,
      autoSwitch: parsed.settings?.autoSwitch ?? true,
      soundEnabled: parsed.settings?.soundEnabled ?? true
    }
  } catch {
    // Ignore invalid stored data
  }
}

/**
 * Switch mode and reset timer.
 */
const setMode = (targetMode: PomodoroMode) => {
  if (mode.value === targetMode) return
  mode.value = targetMode
  remainingMs.value = getDurationMs(targetMode)
  if (isRunning.value) {
    startTimer()
  }
}

/**
 * Play a short notification sound.
 */
const playSound = () => {
  if (!settings.value.soundEnabled) return
  const ctx = audioContext ?? new AudioContext()
  audioContext = ctx
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 880
  gainNode.gain.value = 0.12

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.2)
}

/**
 * Handle a completed timer cycle.
 */
const handleComplete = () => {
  pauseTimer()
  playSound()

  if (mode.value === 'focus') {
    cycleCount.value += 1
    const nextMode = cycleCount.value % settings.value.cyclesBeforeLong === 0 ? 'long' : 'short'
    mode.value = nextMode
  } else {
    mode.value = 'focus'
  }

  remainingMs.value = getDurationMs(mode.value)
  if (settings.value.autoSwitch) {
    startTimer()
  }
}

/**
 * Timer tick to update remaining time.
 */
const tick = () => {
  const now = Date.now()
  const delta = now - lastTick
  lastTick = now
  remainingMs.value = Math.max(0, remainingMs.value - delta)
  if (remainingMs.value === 0) {
    handleComplete()
  }
}

/**
 * Start the timer.
 */
const startTimer = () => {
  if (isRunning.value) return
  if (remainingMs.value <= 0) {
    remainingMs.value = getDurationMs(mode.value)
  }
  isRunning.value = true
  lastTick = Date.now()
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(tick, 200)
}

/**
 * Pause the timer.
 */
const pauseTimer = () => {
  isRunning.value = false
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

/**
 * Reset the timer for current mode.
 */
const resetTimer = () => {
  pauseTimer()
  remainingMs.value = getDurationMs(mode.value)
}

const timeLabel = computed(() => formatTime(remainingMs.value))
const documentTitle = useTitle()

const cycleProgress = computed(() => {
  const total = settings.value.cyclesBeforeLong
  if (total <= 0) return 1
  return (cycleCount.value % total) + 1
})

const completedCycles = computed(() => {
  const total = settings.value.cyclesBeforeLong
  return Math.min(Math.max(0, cycleCount.value), total)
})

watchEffect(() => {
  documentTitle.value = `${timeLabel.value} | ${isRunning.value ? 'Running' : 'Pause'}`
})

watch([mode, remainingMs, isRunning, cycleCount, settings], () => {
  saveState()
})

watch(
  () => settings.value,
  () => {
    if (!isRunning.value) {
      remainingMs.value = getDurationMs(mode.value)
    }
  },
  { deep: true }
)

onMounted(() => {
  loadState()
})

onUnmounted(() => {
  pauseTimer()
  documentTitle.value = themeStore.title
})
</script>

<template>
  <div class="w-full max-w-md mx-auto bg-backdrop p-4 rounded-3xl  mt-3 sm:mt-9">

    <div class="flex flex-col gap-6 sm:m-6">
      <div class="flex items-center justify-center gap-3">
        <button class="btn" @click="isRunning ? pauseTimer() : startTimer()">
          <i :class="isRunning ? 'i-pixelarticons:pause' : 'i-pixelarticons:play'"></i>
        </button>
        <button class="btn" @click="resetTimer">
          <i class="i-pixelarticons:reload"></i>
        </button>
        <button class="btn" @click="settings.soundEnabled = !settings.soundEnabled">
          <i :class="settings.soundEnabled ? 'i-pixelarticons:volume-3' : 'i-pixelarticons:volume'"></i>
        </button>
        <Popover>
          <template #button>
            <button class="btn">
              <i class="i-pixelarticons:clock"></i>
            </button>
          </template>
          <div class="p-4 space-y-4 text-[#5e2c2a] min-w-[250px]">
            <h3 class="font-bold text-lg border-b border-[#5e2c2a]/20 pb-2">{{ t('pomodoro.settings') }}</h3>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">{{ t('pomodoro.focus') }}</span>
              <div class="flex items-center gap-2">
                <input v-model.number="settings.focusMinutes" type="number" min="1"
                  class="input-base w-16 px-2 py-1 input text-center" />
                <span class="text-xs">{{ t('pomodoro.minutes') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">{{ t('pomodoro.short') }}</span>
              <div class="flex items-center gap-2">
                <input v-model.number="settings.shortMinutes" type="number" min="1"
                  class="input-base w-16 px-2 py-1 input text-center" />
                <span class="text-xs">{{ t('pomodoro.minutes') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">{{ t('pomodoro.long') }}</span>
              <div class="flex items-center gap-2">
                <input v-model.number="settings.longMinutes" type="number" min="1"
                  class="input-base w-16 px-2 py-1 input text-center" />
                <span class="text-xs">{{ t('pomodoro.minutes') }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">{{ t('pomodoro.autoStart') }}</span>
              <CheckBox v-model="settings.autoSwitch" />
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-sm">{{ t('pomodoro.soundEnabled') }}</span>
              <CheckBox v-model="settings.soundEnabled" />
            </div>
          </div>
        </Popover>
      </div>

      <div class="relative flex h-72 w-72 items-center justify-center rounded-full bg-white/20 ring-8 ring-primary/30">
        <div class="text-6xl font-semibold text-text tracking-widest select-none"
          @click="isRunning ? pauseTimer() : startTimer()">
          {{ timeLabel }}
        </div>
      </div>

      <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>{{ t('pomodoro.circle') }} {{ cycleProgress }}</span>
          <span v-for="index in settings.cyclesBeforeLong" :key="index" class="inline-flex">
            <i class="i-pixelarticons:coffee-alt"
              :class="index <= completedCycles ? 'text-primary' : 'text-gray-300'" />
          </span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button class="btn" @click="setMode('focus')">
          {{ t('pomodoro.focus') }}
        </button>
        <button class="btn" @click="setMode('short')">
          {{ t('pomodoro.short') }}
        </button>
        <button class="btn" @click="setMode('long')">
          {{ t('pomodoro.long') }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped></style>
