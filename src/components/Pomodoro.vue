<script lang="ts" setup>
import CheckBox from '@/components/common/CheckBox.vue';
import { useThemeStore } from '@/stores/theme';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useTitle } from '@vueuse/core';
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

type PomodoroMode = 'focus' | 'short' | 'long'

const mode = ref<PomodoroMode>('focus')
const remainingMs = ref(25 * 60 * 1000)
const isRunning = ref(false)
const cycleCount = ref(0)
const { t } = useI18n()
const themeStore = useThemeStore()
const pomodoroStore = usePomodoroStore()

let intervalId: number | null = null
let lastTick = 0
let audioContext: AudioContext | null = null

const STORAGE_KEY = 'pomodoroState'

interface PomodoroTimerState {
  mode: PomodoroMode
  remainingMs: number
  isRunning: boolean
  cycleCount: number
}

/**
 * Get the duration in milliseconds for a given mode.
 */
const getDurationMs = (targetMode: PomodoroMode): number => {
  const minutes = targetMode === 'focus'
    ? pomodoroStore.settings.focusMinutes
    : targetMode === 'short'
      ? pomodoroStore.settings.shortMinutes
      : pomodoroStore.settings.longMinutes
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
  const payload: PomodoroTimerState = {
    mode: mode.value,
    remainingMs: remainingMs.value,
    isRunning: isRunning.value,
    cycleCount: cycleCount.value
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
    const parsed = JSON.parse(stored) as PomodoroTimerState
    mode.value = parsed.mode || 'focus'
    remainingMs.value = parsed.remainingMs || getDurationMs(parsed.mode || 'focus')
    isRunning.value = false
    cycleCount.value = Number.isFinite(parsed.cycleCount) ? Math.max(0, parsed.cycleCount) : 0
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
  if (!pomodoroStore.settings.soundEnabled) return
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
    const nextMode = cycleCount.value % pomodoroStore.settings.cyclesBeforeLong === 0 ? 'long' : 'short'
    mode.value = nextMode
  } else {
    mode.value = 'focus'
  }

  remainingMs.value = getDurationMs(mode.value)
  if (pomodoroStore.settings.autoSwitch) {
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
  const total = pomodoroStore.settings.cyclesBeforeLong
  if (total <= 0) return 1
  return (cycleCount.value % total) + 1
})

const completedCycles = computed(() => {
  const total = pomodoroStore.settings.cyclesBeforeLong
  return Math.min(Math.max(0, cycleCount.value), total)
})

watchEffect(() => {
  documentTitle.value = `${timeLabel.value} | ${isRunning.value ? 'Running' : 'Pause'}`
})

watch([mode, remainingMs, isRunning, cycleCount], () => {
  saveState()
})

onMounted(() => {
  pomodoroStore.loadSettings()
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
        <button class="btn" @click="pomodoroStore.settings.soundEnabled = !pomodoroStore.settings.soundEnabled; pomodoroStore.saveSettings()">
          <i :class="pomodoroStore.settings.soundEnabled ? 'i-pixelarticons:volume-3' : 'i-pixelarticons:volume'"></i>
        </button>
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
          <span v-for="index in pomodoroStore.settings.cyclesBeforeLong" :key="index" class="inline-flex">
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
