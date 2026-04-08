<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import CheckBox from '@/components/common/CheckBox.vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
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
    cycleCount.value = parsed.cycleCount || 0
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

const cycleProgress = computed(() => {
  if (settings.value.cyclesBeforeLong <= 0) return 0
  const mod = cycleCount.value % settings.value.cyclesBeforeLong
  return mod === 0 && cycleCount.value > 0 ? settings.value.cyclesBeforeLong : mod
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
})
</script>

<template>
  <div class="w-2xl mx-auto">
    <div class="bg-background rounded-xl shadow-sm border p-6">
      <div class="flex items-center justify-between gap-4">
        <div class="inline-flex rounded-full bg-gray-100 p-1">
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="mode === 'focus' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'"
            @click="setMode('focus')"
          >
            {{ t('pomodoro.focus') }}
          </button>
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="mode === 'short' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'"
            @click="setMode('short')"
          >
            {{ t('pomodoro.short') }}
          </button>
          <button
            class="px-4 py-2 rounded-full text-sm font-medium transition"
            :class="mode === 'long' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'"
            @click="setMode('long')"
          >
            {{ t('pomodoro.long') }}
          </button>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <span>{{ t('pomodoro.circle') }} {{ cycleProgress }}</span>
            <div class="flex items-center gap-1">
              <span
                v-for="index in settings.cyclesBeforeLong"
                :key="index"
                class="inline-flex"
              >
                <i
                  class="i-pixelarticons:coffee-alt w-4 h-4"
                  :class="index <= cycleProgress ? 'text-primary' : 'text-gray-300'"
                />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center gap-6">
        <div class="text-6xl font-semibold text-gray-900 tracking-widest">
          {{ timeLabel }}
        </div>
        <div class="flex items-center gap-3">
          <button
            class="btn rounded-full"
            :class="isRunning ? 'bg-white text-primary border border-solid border-primary' : 'btn hover:opacity-90'"
            @click="isRunning ? pauseTimer() : startTimer()"
          >
            <i :class="isRunning ? 'i-pixelarticons:pause' : 'i-pixelarticons:play'"></i>
          </button>
          <button
            class="btn rounded-full"
            @click="resetTimer"
          >
            <i class="i-pixelarticons:reload"></i>
          </button>
          <button
            class="btn rounded-full"
            @click="settings.soundEnabled = !settings.soundEnabled"
            :title="settings.soundEnabled ? 'Mute sound' : 'Enable sound'"
          >
            <i :class="settings.soundEnabled ? 'i-pixelarticons:volume-3' : 'i-pixelarticons:volume-x'" />
          </button>
          <Popover>
            <template #button>
              <img src="../assets/icons/Time_Icon.png" alt="Time Settings" class="w-8 h-8" />
            </template>
            <div class="p-4 space-y-4 text-[#5e2c2a] min-w-[250px]">
              <h3 class="font-bold text-lg border-b border-[#5e2c2a]/20 pb-2">{{ t('pomodoro.settings') }}</h3>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ t('pomodoro.focus') }}</span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="settings.focusMinutes"
                    type="number"
                    min="1"
                    class="w-16 px-2 py-1 input text-center"
                  />
                  <span class="text-xs">{{ t('pomodoro.minutes') }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ t('pomodoro.short') }}</span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="settings.shortMinutes"
                    type="number"
                    min="1"
                    class="w-16 px-2 py-1 input text-center"
                  />
                  <span class="text-xs">{{ t('pomodoro.minutes') }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ t('pomodoro.long') }}</span>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="settings.longMinutes"
                    type="number"
                    min="1"
                    class="w-16 px-2 py-1 input text-center"
                  />
                  <span class="text-xs">{{ t('pomodoro.minutes') }}</span>
                </div>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-sm">{{ t('pomodoro.autoStart') }}</span>
                <CheckBox v-model="settings.autoSwitch" />
              </div>
            </div>
          </Popover>
        </div>
      </div>
    </div>


  </div>
</template>

<style scoped>
</style>
