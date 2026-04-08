import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface PomodoroSession {
  id: string
  name: string
  focusTime: number // 专注时间（分钟）
  timerMode: 'countdown' | 'accumulate' // 倒计时或正计时
  createdAt: number
}

export const usePomodoroStore = defineStore('pomodoro', () => {
  const currentSession = ref<PomodoroSession | null>(null)

  // 从localStorage加载数据
  const loadSession = () => {
    const stored = localStorage.getItem('currentSession')
    if (stored) {
      currentSession.value = JSON.parse(stored)
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
    createSession,
    deleteSession,
    updateSession,
    hasSession,
    loadSession,
    saveSession
  }
})
