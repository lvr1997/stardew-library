<script setup lang="ts">
import { ref, computed, reactive, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemoStore, type Memo } from '../stores/memo'
import MemosBg from '@/assets/themes/Memos_bg.png'
import LetterBg from '@/assets/themes/letterBG.png'
import MemoItem from './MemoItem.vue'

const { t } = useI18n()
const memoStore = useMemoStore()

// State
const viewMode = ref<'board' | 'detail'>('board')
const selectedMemo = ref<Memo | null>(null)
const editContent = ref('')

// Computed
const sortedMemos = computed(() => {
  return memoStore.getAllMemos()
})

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

// 为每个便签生成随机初始位置（缓存避免重复生成）
const memoPositions = reactive<Record<string, { x: number; y: number }>>({})
const getMemoPosition = (memoId: string, index: number) => {
  if (!memoPositions[memoId]) {
    const cols = 6
    const col = index % cols
    const row = Math.floor(index / cols)
    const baseX = 15 + col * 85 + (Math.random() - 0.5) * 15
    const baseY = 15 + row * 70 + (Math.random() - 0.5) * 10
    memoPositions[memoId] = { x: baseX, y: baseY }
  }
  return memoPositions[memoId]
}

// 处理便签点击
const handleMemoClick = (memo: Memo) => {
  openDetail(memo)
}

// 便签墙容器引用
const boardRef = useTemplateRef<HTMLElement>('boardRef')
</script>

<template>
  <div 
    class="w-full h-full min-h-[380px] bg-cover bg-center border-solid rounded-md overflow-hidden relative"
    :style="{ backgroundImage: `url(${MemosBg})`, borderWidth: '16px', borderColor: '#402202' }"
  >
    <!-- Board View - 便签墙 -->
    <div v-if="viewMode === 'board'" class="flex flex-col items-center bg-transparent h-full">
      <!-- 新建按钮 - 右上角 -->
      <button
        @click="createNewMemo"
        class="absolute bottom-3 right-2 p-2 bg-primary hover:bg-primary text-white rounded-full shadow-md transition z-10"
        title="新建便签"
      >
        <i class="i-pixelarticons:plus w-5 h-5" />
      </button>

      <!-- Empty State -->
      <div v-if="sortedMemos.length === 0" class="flex flex-col items-center justify-center text-text/70 bg-transparent flex-1">
        <i class="i-tabler-notes-off w-12 h-12 mb-2 opacity-50" />
        <p class="text-xs">{{ t('memos.empty') }}</p>
        <button
          @click="createNewMemo"
          class="mt-3 px-3 py-1 bg-primary/80 hover:bg-primary text-white text-xs rounded transition"
        >
          {{ t('memos.create') }}
        </button>
      </div>

      <!-- Memo Grid - 便签墙 -->
      <div v-else ref="boardRef" class="w-full flex-1 relative overflow-y-auto">
        <MemoItem
          v-for="(memo, index) in sortedMemos"
          :key="memo.id"
          :memo="memo"
          :initial-x="getMemoPosition(memo.id, index).x"
          :initial-y="getMemoPosition(memo.id, index).y"
          :container-element="boardRef"
          @click="handleMemoClick(memo)"
        />
      </div>

    </div>

    <!-- Detail View - 便签详情 -->
    <div v-else-if="viewMode === 'detail' && selectedMemo" class="flex flex-col p-4 bg-transparent h-full">

      <!-- 编辑区域 - 居中，使用信纸背景 -->
      <div class="flex-1 flex flex-col items-center justify-center p-6" :style="{ backgroundImage: `url(${LetterBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
        <!-- 日期显示 -->
        <div class="w-full mb-2 bg-transparent">
          <p class="text-[10px] text-gray-600">
            {{ formatFullDate(selectedMemo.createdAt) }}
          </p>
        </div>

        <!-- 编辑框 -->
        <textarea
          v-model="editContent"
          class="w-full flex-1 p-3 text-xs text-gray-800 bg-transparent border-none resize-none focus:outline-none placeholder:text-gray-500/70"
          :placeholder="t('memos.placeholder')"
          autofocus
          @keydown="handleKeydown"
        />

        <!-- 底部操作栏 -->
        <div class="w-full flex items-center justify-between mt-2 bg-transparent">
          <button
            @click="deleteMemo"
            class="text-red-500 hover:opacity-80 transition bg-transparent"
            title="删除"
          >
            <i class="i-pixelarticons:trash w-4 h-4" />
          </button>
          <div class="flex items-center gap-2">
            <button
              @click="backToBoard"
              class="px-2 py-1 text-xs text-gray-600 hover:bg-white/30 rounded transition"
            >
              {{ t('memos.cancel') }}
            </button>
            <button
              @click="saveMemo"
              class="px-3 py-1 text-xs bg-primary text-white hover:bg-hover rounded transition"
            >
              {{ t('memos.save') }}
            </button>
          </div>
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
