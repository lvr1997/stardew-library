<script lang="ts" setup>
import Popover from '@/components/common/Popover.vue';
import Settings from '@/components/Settings.vue';
import { useThemeStore } from '@/stores/theme';

type ModuleKey = 'pomodoro' | 'memos'

defineProps<{
  visibleModules: Record<ModuleKey, boolean>
}>()

const emit = defineEmits<{
  toggle: [module: ModuleKey]
}>()

const themeStore = useThemeStore()

const toggleModule = (module: ModuleKey) => {
  emit('toggle', module)
}
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row p-3 rounded-xl items-center sm:items-center sm:justify-between max-w-3xl mx-auto bg-backdrop">
    <h1 class="text-3xl font-bold text-primary">{{ themeStore.title }}</h1>

    <div class="flex gap-2">
      
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
      <Popover>
        <Settings />
      </Popover>
    </div>
  </div>
</template>
