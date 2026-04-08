<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemoStore, type Memo } from '../stores/memo'

const { t } = useI18n()
const memoStore = useMemoStore()

// State
const viewMode = ref<'board' | 'detail'>('board')
const selectedMemo = ref<Memo | null>(null)
const editContent = ref('')

// 便签颜色列表 - 柔和的便签纸颜色
const memoColors = [
  { bg: '#fef3c7', border: '#f59e0b', header: '#fbbf24' }, // 黄色
  { bg: '#dbeafe', border: '#3b82f6', header: '#60a5fa' }, // 蓝色
  { bg: '#fce7f3', border: '#ec4899', header: '#f472b6' }, // 粉色
  { bg: '#d1fae5', border: '#10b981', header: '#34d399' }, // 绿色
  { bg: '#e9d5ff', border: '#8b5cf6', header: '#a78bfa' }, // 紫色
  { bg: '#fed7aa', border: '#f97316', header: '#fb923c' }, // 橙色
  { bg: '#ccfbf1', border: '#14b8a6', header: '#2dd4bf' }, // 青色
  { bg: '#fecaca', border: '#ef4444', header: '#f87171' }, // 红色
]

// Computed
const sortedMemos = computed(() => {
  return memoStore.getAllMemos()
})

// 根据memo id获取固定的颜色
const getMemoColor = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % memoColors.length
  return memoColors[index]
}

// 格式化日期
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

// 格式化完整日期
const formatFullDate = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取预览文本（前20个字符）
const getPreview = (content: string): string => {
  const lines = content.split('\n')
  const firstLine = lines[0] || ''
  if (firstLine.length > 20) {
    return firstLine.slice(0, 20) + '...'
  }
  return firstLine || '(空白便签)'
}

// 切换到详情视图
const openDetail = (memo: Memo) => {
  selectedMemo.value = memo
  editContent.value = memo.content
  viewMode.value = 'detail'
}

// 返回便签墙
const backToBoard = () => {
  viewMode.value = 'board'
  selectedMemo.value = null
  editContent.value = ''
}

// 创建新便签
const createNewMemo = () => {
  const newMemo = memoStore.addMemo('')
  openDetail(newMemo)
}

// 保存便签
const saveMemo = () => {
  if (selectedMemo.value) {
    const content = editContent.value.trim()
    if (content) {
      memoStore.updateMemo(selectedMemo.value.id, editContent.value)
    } else {
      // 如果内容为空，删除便签
      memoStore.deleteMemo(selectedMemo.value.id)
    }
  }
  backToBoard()
}

// 删除便签
const deleteMemo = () => {
  if (selectedMemo.value) {
    memoStore.deleteMemo(selectedMemo.value.id)
    backToBoard()
  }
}

// 处理按键事件
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    saveMemo()
  }
}
</script>

<template>
  <div class="flex flex-col h-64 w-64 rounded-lg border bg-[#d4a574] text-[var(--color-text)] border-[#8b6914] shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-2 bg-[#c49a6c] border-b border-[#8b6914]">
      <h2 class="text-sm font-bold text-white flex items-center gap-1">
        <i class="i-pixelarticons:notes w-4 h-4" />
        {{ t('memos.title') }}
      </h2>
      <div class="flex items-center gap-1">
        <!-- 返回按钮（仅在详情视图显示） -->
        <button
          v-if="viewMode === 'detail'"
          @click="saveMemo"
          class="p-1 text-white hover:bg-white/20 rounded transition"
          title="返回"
        >
          <i class="i-pixelarticons:arrow-left w-4 h-4" />
        </button>
        <!-- 新建按钮 -->
        <button
          @click="createNewMemo"
          class="p-1 text-white hover:bg-white/20 rounded transition"
          title="新建便签"
        >
          <i class="i-pixelarticons:plus w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Board View - 便签墙 -->
    <div
      v-if="viewMode === 'board'"
      class="flex-1 overflow-y-auto p-3"
    >
      <!-- Empty State -->
      <div v-if="sortedMemos.length === 0" class="flex flex-col items-center justify-center h-full text-white/70">
        <i class="i-tabler-notes-off w-12 h-12 mb-2 opacity-50" />
        <p class="text-xs">{{ t('memos.empty') }}</p>
        <button
          @click="createNewMemo"
          class="mt-3 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded transition"
        >
          {{ t('memos.create') }}
        </button>
      </div>

      <!-- Memo Grid - 便签网格 -->
      <div v-else class="grid grid-cols-2 gap-2">
        <div
          v-for="memo in sortedMemos"
          :key="memo.id"
          @click="openDetail(memo)"
          class="relative p-2 rounded cursor-pointer transition transform hover:scale-105 hover:shadow-md"
          :style="{
            backgroundColor: getMemoColor(memo.id).bg,
            borderTop: `3px solid ${getMemoColor(memo.id).header}`
          }"
        >
          <!-- 便签内容预览 -->
          <p class="text-[10px] text-gray-700 leading-tight line-clamp-3">
            {{ getPreview(memo.content) }}
          </p>
          <!-- 日期 -->
          <p class="text-[8px] text-gray-500 mt-1">
            {{ formatDate(memo.createdAt) }}
          </p>
          <!-- 胶带效果 -->
          <div
            class="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-3 opacity-60"
            :style="{ backgroundColor: getMemoColor(memo.id).header }"
          />
        </div>
      </div>
    </div>

    <!-- Detail View - 便签详情 -->
    <div
      v-else-if="viewMode === 'detail' && selectedMemo"
      class="flex flex-col flex-1 bg-[#fef9e7]"
    >
      <!-- 日期显示 -->
      <div class="px-3 py-1 bg-[#f5e6c8] border-b border-[#e5d5b0]">
        <p class="text-[10px] text-gray-500">
          {{ formatFullDate(selectedMemo.createdAt) }}
        </p>
      </div>

      <!-- 编辑区域 -->
      <div class="flex-1 p-3">
        <textarea
          v-model="editContent"
          class="w-full h-full p-2 text-xs text-gray-800 bg-transparent border-none resize-none focus:outline-none"
          :placeholder="t('memos.placeholder')"
          autofocus
          @keydown="handleKeydown"
        />
      </div>

      <!-- 底部操作栏 -->
      <div class="flex items-center justify-between px-3 py-2 bg-[#f5e6c8] border-t border-[#e5d5b0]">
        <button
          @click="deleteMemo"
          class="p-1 text-red-500 hover:bg-red-50 rounded transition"
          title="删除"
        >
          <i class="i-pixelarticons:trash w-4 h-4" />
        </button>
        <div class="flex items-center gap-2">
          <button
            @click="backToBoard"
            class="px-2 py-1 text-xs text-gray-600 hover:bg-white/50 rounded transition"
          >
            {{ t('memos.cancel') }}
          </button>
          <button
            @click="saveMemo"
            class="px-3 py-1 text-xs bg-[#d4a574] text-white hover:bg-[#c49a6c] rounded transition"
          >
            {{ t('memos.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(139, 105, 20, 0.3);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 105, 20, 0.5);
}

/* 多行文本截断 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
