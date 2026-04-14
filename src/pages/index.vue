<script lang="ts" setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import Memos from '@/components/Memos.vue';
import Pomodoro from '@/components/Pomodoro.vue';
import { useMemoStore } from '@/stores/memo';
import { usePomodoroStore } from '@/stores/pomodoro';
import { useThemeStore } from '@/stores/theme';
import { onMounted, ref } from 'vue';

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
  pomodoro: false, 
  memos: true
})

const toggleModule = (module: 'pomodoro' | 'memos') => {
  if (isSingleModuleMode()) {
    // 移动端/平板竖屏：只能显示一个，切换时关闭其他
    visibleModules.value = {
      pomodoro: module === 'pomodoro',
      memos: module === 'memos'
    }
  } else {
    // 平板横屏/PC端：自由切换
    visibleModules.value[module] = !visibleModules.value[module]
  }
}

const sessionStore = usePomodoroStore()
const memoStore = useMemoStore()
const themeStore = useThemeStore()

// Load theme settings (includes title and description)
themeStore.loadSavedSettings()

onMounted(() => {
  // Load data from localStorage on app startup
  sessionStore.loadSession()
  memoStore.loadMemos()
})
</script>

<template>
  <div class="min-h-screen justify-top px-8 py-4 sm:py-8 relative z-[100]">
    <AppHeader
      :visible-modules="visibleModules"
      @toggle="toggleModule"
    />

    <!-- Main Panel -->
    <div class="px-6 w-full flex flex-col gap-4" >
      <Transition name="fade">
        <Pomodoro v-if="visibleModules.pomodoro" />
      </Transition>
      <Transition name="fade">
        <Memos v-if="visibleModules.memos" />
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
