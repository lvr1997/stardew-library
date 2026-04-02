<script lang="ts" setup>
import SessionPanel from '@/components/SessionPanel.vue'
import TodoPanel from '@/components/TodoPanel.vue'
import { useSessionStore } from '@/stores/session'
import { useTodoStore } from '@/stores/todolist'
import { onMounted } from 'vue'

const sessionStore = useSessionStore()
const todoStore = useTodoStore()

onMounted(() => {
  // Load data from localStorage on app startup
  sessionStore.loadSession()
  todoStore.loadTodos()
})
</script>

<template>
  <div class="body-container min-h-screen bg-gray-50">
    <!-- Header: SessionPanel, Title, TodoPanel in one row -->
     <div class="flex items-top justify-between gap-6 p-6">
        <!-- Left: SessionPanel -->
        <div class="flex-shrink-0 w-64">
          <SessionPanel />
        </div>

        <!-- Center: Title -->
        <div class="flex-1 text-center">
          <h1 class="text-3xl font-bold text-yellow-600/50">Stardew Library</h1>
          <p class="text-gray-500 my-2">Welcome to your personal study space</p>
        </div>

        <!-- Right: TodoPanel -->
        <div class="flex-shrink-0 w-64">
          <TodoPanel />
        </div>
      </div>

 
  </div>
</template>

<style scoped>
.body-container {
  /* background: url(../assets/bg.png) no-repeat; */
}
</style>