<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMemoStore, type Memo } from '../stores/memo'
import MemosBg from '@/assets/themes/Memos_bg.png'
import LetterBg from '@/assets/themes/letterBG.png'
import MemoItem from './MemoItem.vue'

const { t } = useI18n()
const memoStore = useMemoStore()

const MEMO_WIDTH = 144
const MEMO_HEIGHT = 112
const MEMO_GAP = 14
const BOARD_PADDING = 16
const RANDOM_ATTEMPTS = 40
const SCAN_STEP = 24

// State
const viewMode = ref<'board' | 'detail'>('board')
const selectedMemo = ref<Memo | null>(null)
const editContent = ref('')

// Computed
const sortedMemos = computed(() => {
  return memoStore.getAllMemos()
})

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

const openDetail = (memo: Memo) => {
  selectedMemo.value = memo
  editContent.value = memo.content
  viewMode.value = 'detail'
}

const backToBoard = () => {
  viewMode.value = 'board'
  selectedMemo.value = null
  editContent.value = ''
}

const isMemoOverlapping = (
  candidate: { x: number; y: number },
  existingMemos: Memo[],
  ignoreMemoId?: string
) => {
  return existingMemos.some((memo) => {
    if (memo.id === ignoreMemoId) return false
    if (typeof memo.x !== 'number' || typeof memo.y !== 'number') return false

    return !(
      candidate.x + MEMO_WIDTH + MEMO_GAP <= memo.x ||
      candidate.x >= memo.x + MEMO_WIDTH + MEMO_GAP ||
      candidate.y + MEMO_HEIGHT + MEMO_GAP <= memo.y ||
      candidate.y >= memo.y + MEMO_HEIGHT + MEMO_GAP
    )
  })
}

const containerRef = useTemplateRef<HTMLElement>('containerRef')
const boardRef = useTemplateRef<HTMLElement>('boardRef')

const getBoardBounds = () => {
  const container = boardRef.value ?? containerRef.value
  const width = Math.max(MEMO_WIDTH + BOARD_PADDING * 2, (container?.clientWidth ?? 720) - BOARD_PADDING * 2)
  const height = Math.max(MEMO_HEIGHT + BOARD_PADDING * 2, (container?.clientHeight ?? 420) - BOARD_PADDING * 2)

  return {
    maxX: Math.max(BOARD_PADDING, width - MEMO_WIDTH),
    maxY: Math.max(BOARD_PADDING, height - MEMO_HEIGHT),
  }
}

const generateMemoPosition = (ignoreMemoId?: string) => {
  const bounds = getBoardBounds()
  const existingMemos = sortedMemos.value

  for (let attempt = 0; attempt < RANDOM_ATTEMPTS; attempt += 1) {
    const candidate = {
      x: BOARD_PADDING + Math.random() * Math.max(0, bounds.maxX - BOARD_PADDING),
      y: BOARD_PADDING + Math.random() * Math.max(0, bounds.maxY - BOARD_PADDING),
    }

    if (!isMemoOverlapping(candidate, existingMemos, ignoreMemoId)) {
      return {
        x: Math.round(candidate.x),
        y: Math.round(candidate.y),
      }
    }
  }

  for (let y = BOARD_PADDING; y <= bounds.maxY; y += SCAN_STEP) {
    for (let x = BOARD_PADDING; x <= bounds.maxX; x += SCAN_STEP) {
      const candidate = { x, y }
      if (!isMemoOverlapping(candidate, existingMemos, ignoreMemoId)) {
        return candidate
      }
    }
  }

  return { x: BOARD_PADDING, y: BOARD_PADDING }
}

const ensureMemoPositions = () => {
  for (const memo of sortedMemos.value) {
    if (typeof memo.x !== 'number' || typeof memo.y !== 'number') {
      memoStore.updateMemoPosition(memo.id, generateMemoPosition(memo.id))
    }
  }
}

const createNewMemo = () => {
  const newMemo = memoStore.addMemo('', generateMemoPosition())
  openDetail(newMemo)
}

const saveMemo = () => {
  if (selectedMemo.value) {
    const content = editContent.value.trim()
    if (content) {
      memoStore.updateMemo(selectedMemo.value.id, editContent.value)
    } else {
      memoStore.deleteMemo(selectedMemo.value.id)
    }
  }
  backToBoard()
}

const deleteMemo = () => {
  if (selectedMemo.value) {
    memoStore.deleteMemo(selectedMemo.value.id)
    backToBoard()
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    saveMemo()
  }
}

const handleMemoClick = (memo: Memo) => {
  openDetail(memo)
}

const handleMemoPositionChange = (memoId: string, position: { x: number; y: number }) => {
  memoStore.updateMemoPosition(memoId, position)
}

onMounted(() => {
  nextTick(() => {
    ensureMemoPositions()
  })
})
</script>

<template>
  <div
    ref="containerRef"
    class="w-2xl h-full min-h-[380px] mx-auto bg-cover bg-center border-solid rounded-md overflow-hidden relative"
    :style="{ backgroundImage: `url(${MemosBg})`, borderWidth: '16px', borderColor: '#402202' }"
  >
    <div v-if="viewMode === 'board'" class="flex flex-col items-center bg-transparent h-full">
      <button
        @click="createNewMemo"
        class="absolute bottom-0 right-3 p-2 bg-primary hover:bg-primary text-white rounded-full shadow-md transition z-10"
        :title="t('memos.create')"
      >
        <i class="i-pixelarticons:plus" />
      </button>

      <div v-if="sortedMemos.length === 0" class="flex flex-col items-center justify-center text-white bg-transparent flex-1">
        <p class="my-3">{{ t('memos.empty') }}</p>
      </div>

      <div v-else ref="boardRef" class="w-full flex-1 relative overflow-y-auto">
        <MemoItem
          v-for="memo in sortedMemos"
          :key="memo.id"
          :memo="memo"
          :initial-x="memo.x"
          :initial-y="memo.y"
          :container-element="boardRef"
          @position-change="handleMemoPositionChange(memo.id, $event)"
          @click="handleMemoClick(memo)"
        />
      </div>
    </div>

    <div v-else-if="viewMode === 'detail' && selectedMemo" class="flex flex-col p-4 bg-transparent h-full">
      <div
        class="flex-1 flex flex-col items-center justify-center p-6"
        :style="{ backgroundImage: `url(${LetterBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }"
      >
        <div class="w-full mb-2 bg-transparent">
          <p class="text-sm text-gray-600">
            {{ formatFullDate(selectedMemo.createdAt) }}
          </p>
        </div>

        <textarea
          v-model="editContent"
          class="w-full flex-1 p-3 text-sm text-gray-800 bg-transparent border-none resize-none focus:outline-none placeholder:text-gray-500/70"
          :placeholder="t('memos.placeholder')"
          autofocus
          @keydown="handleKeydown"
        />

        <div class="w-full flex items-center justify-between mt-2 bg-transparent">
          <button
            @click="deleteMemo"
            class="text-red-500 hover:opacity-80 transition bg-transparent"
            title="删除"
          >
            <i class="i-pixelarticons:trash" />
          </button>
          <div class="flex items-center gap-2">
            <button
              @click="backToBoard"
              class="px-2 py-1 text-sm text-gray-600 hover:bg-white/30 rounded transition"
            >
              {{ t('memos.cancel') }}
            </button>
            <button
              @click="saveMemo"
              class="px-3 py-1 text-sm bg-primary text-white hover:bg-hover rounded transition"
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
</style>
