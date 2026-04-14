import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  name: string
  focusTime: number // 专注时间（分钟）
  timerMode: 'countdown' | 'accumulate' // 倒计时或正计时
  createdAt: number
}

export interface PomodoroSettings {
  focusMinutes: number
  shortMinutes: number
  longMinutes: number
  cyclesBeforeLong: number
  autoSwitch: boolean
  soundEnabled: boolean
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortMinutes: 5,
  longMinutes: 15,
  cyclesBeforeLong: 4,
  autoSwitch: true,
  soundEnabled: true
}

const SETTINGS_STORAGE_KEY = 'pomodoroSettings'

export const usePomodoroStore = defineStore('pomodoro', () => {
  const currentSession = ref<PomodoroSession | null>(null)
  const settings = ref<PomodoroSettings>(DEFAULT_SETTINGS)

  // 从localStorage加载数据
  const loadSession = () => {
    const stored = localStorage.getItem('currentSession')
    if (stored) {
      currentSession.value = JSON.parse(stored)
    }
  }

  // 加载设置
  const loadSettings = () => {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      try {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      } catch {
        settings.value = DEFAULT_SETTINGS
      }
    }
  }

  // 保存到localStorage
  const saveSession = () => {
    if (currentSession.value) {
      localStorage.setItem('currentSession', JSON.stringify(currentSession.value))
    } else {
      localStorage.removeItem('currentSession')
    }
  }

  // 保存设置
  const saveSettings = () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value))
  }

  // 更新设置
  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettings()
  }

  // 重置设置
  const resetSettings = () => {
    settings.value = DEFAULT_SETTINGS
    saveSettings()
  }

  const createSession = (name: string, focusTime: number, timerMode: 'countdown' | 'accumulate' = 'countdown') => {
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      name,
      focusTime,
      timerMode,
      createdAt: Date.now()
    }
    currentSession.value = newSession
    saveSession()
    return newSession
  }

  const deleteSession = () => {
    currentSession.value = null
    saveSession()
  }

  const updateSession = (name: string, focusTime: number) => {
    if (currentSession.value) {
      currentSession.value.name = name
      currentSession.value.focusTime = focusTime
      saveSession()
    }
  }

  const hasSession = computed(() => currentSession.value !== null)

  return {
    currentSession,
    settings,
    createSession,
    deleteSession,
    updateSession,
    hasSession,
    loadSession,
    saveSession,
    loadSettings,
    saveSettings,
    updateSettings,
    resetSettings
  }
})
