<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import Memos from '@/components/Memos.vue';
import Pomodoro from '@/components/Pomodoro.vue';
import TodoPanel from '@/components/TodoPanel.vue';
import Settings from '@/components/Settings.vue';
import { useMemoStore } from '@/stores/memo';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useThemeStore } from '@/stores/theme';
import { useTodoStore } from '@/stores/todolist';
import { onMounted, ref, watch } from 'vue';

// 检查设备类型和方向
const isMobile = () => window.innerWidth < 768
const isTabletPortrait = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  return width >= 768 && width < 1024 && height > width
}
const isSingleModuleMode = () => isMobile() || isTabletPortrait()

// 控制三个模块的显示/隐藏
const visibleModules = ref({
  todos: !isMobile(), // PC端默认显示，移动端隐藏
  pomodoro: true, // 始终默认显示
  memos: !isMobile() // PC端默认显示，移动端隐藏
})

const toggleModule = (module: 'todos' | 'pomodoro' | 'memos') => {
  if (isSingleModuleMode()) {
    // 移动端/平板竖屏：只能显示一个，切换时关闭其他
    visibleModules.value = {
      todos: module === 'todos',
      pomodoro: module === 'pomodoro',
      memos: module === 'memos'
    }
  } else {
    // 平板横屏/PC端：自由切换
    visibleModules.value[module] = !visibleModules.value[module]
  }
}

const sessionStore = usePomodoroStore()
const todoStore = useTodoStore()
const memoStore = useMemoStore()
const themeStore = useThemeStore()

// Load theme settings (includes title and description)
themeStore.loadSavedSettings()

// Use store values (defaults are defined in store)
const title = ref(themeStore.title)
const description = ref(themeStore.description)

// Watch for store changes and update local refs
watch(() => themeStore.title, (newVal) => {
  title.value = newVal
})

watch(() => themeStore.description, (newVal) => {
  description.value = newVal
})

onMounted(() => {
  // Load data from localStorage on app startup
  sessionStore.loadSession()
  todoStore.loadTodos()
  todoStore.loadGroups()
  memoStore.loadMemos()
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
      <div class="flex gap-2">
        <button
          class="p-0 bg-transparent border-0 cursor-pointer"
          @click="toggleModule('todos')"
        >
          <img
            src="@/assets/icons/todos_Button.png"
            alt="Toggle Todos"
            class="w-9 h-9 object-cover"
            :style="{ objectPosition: visibleModules.todos ? '0 0' : '100% 0' }"
          />
        </button>
        <button
          class="p-0 bg-transparent border-0 cursor-pointer"
          @click="toggleModule('pomodoro')"
        >
          <img
            src="@/assets/icons/pomodoro_Button.png"
            alt="Toggle Pomodoro"
            class="w-9 h-9 object-cover"
            :style="{ objectPosition: visibleModules.pomodoro ? '0 0' : '100% 0' }"
          />
        </button>
        <button
          class="p-0 bg-transparent border-0 cursor-pointer"
          @click="toggleModule('memos')"
        >
          <img
            src="@/assets/icons/memos_Button.png"
            alt="Toggle Memos"
            class="w-9 h-9 object-cover"
            :style="{ objectPosition: visibleModules.memos ? '0 0' : '100% 0' }"
          />
        </button>
        <!-- Settings Popover -->
        <Popover>
          <Settings />
        </Popover>
      </div>
    </div>

    <!-- Main Panel -->
    <div class="flex flex-col md:flex-row px-6 gap-4">
      <Transition name="fade">
        <TodoPanel 
          v-if="visibleModules.todos" 
          class="flex-1 md:flex-1"
        />
      </Transition>
      <Transition name="fade">
        <Pomodoro 
          v-if="visibleModules.pomodoro" 
          class="flex-1 md:flex-[1.5]"
        />
      </Transition>
      <Transition name="fade">
        <Memos 
          v-if="visibleModules.memos" 
          class="flex-1 md:flex-1"
        />
      </Transition>
    </div>

  </div>
</template>

<style scoped>
/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
