import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export interface Memo {
  id: string
  content: string
  createdAt: number
  updatedAt: number
}

export const useMemoStore = defineStore('memo', () => {
  // Use useLocalStorage for automatic sync
  const memos = useLocalStorage<Memo[]>('memos', [])

  // 添加备忘录
  const addMemo = (content: string): Memo => {
    const now = Date.now()
    const newMemo: Memo = {
      id: now.toString(),
      content,
      createdAt: now,
      updatedAt: now
    }
    memos.value.unshift(newMemo)
    // useLocalStorage auto-saves
    return newMemo
  }

  // 更新备忘录
  const updateMemo = (id: string, content: string) => {
    const memo = memos.value.find(m => m.id === id)
    if (memo) {
      memo.content = content
      memo.updatedAt = Date.now()
      // useLocalStorage auto-saves
    }
  }

  // 删除备忘录
  const deleteMemo = (id: string) => {
    memos.value = memos.value.filter(m => m.id !== id)
    // useLocalStorage auto-saves
  }

  // 获取所有备忘录（按时间倒序）
  const getAllMemos = (): Memo[] => {
    return [...memos.value].sort((a, b) => b.createdAt - a.createdAt)
  }

  // 加载备忘录 - useLocalStorage handles this automatically
  const loadMemos = () => {
    // No-op: useLocalStorage loads automatically on first access
  }

  // 保存备忘录 - useLocalStorage auto-saves
  const saveMemos = () => {
    // useLocalStorage auto-saves on every change
  }

  return {
    memos,
    addMemo,
    updateMemo,
    deleteMemo,
    getAllMemos,
    loadMemos,
    saveMemos
  }
})
