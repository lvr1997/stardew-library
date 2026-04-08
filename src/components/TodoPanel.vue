<template>
  <div class="flex flex-col h-64 w-64 rounded-lg border bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)]">
    <!-- Header -->
    <div class="p-3 border-b border-[var(--color-border)]">
      <h2 class="text-sm font-bold text-[var(--color-text)]">{{ t('todos.title') }}</h2>
    </div>

    <!-- Todo List -->
    <div class="flex-1 overflow-y-auto px-3 py-2">
      <!-- No Groups -->
      <div v-if="allGroups.length === 0" class="text-center text-gray-400 py-4">
        <p class="text-xs">{{ t('todos.empty') }}</p>
      </div>

      <!-- Group List (always visible) -->
      <div v-else class="space-y-1">
        <!-- Each Group Tab/Header -->
        <div
          v-for="group in allGroups"                                                                                                                                   
          :key="group.id"
          class="space-y-1"
        >
          <!-- Group Header (clickable to switch) -->
          <div
            @click="setActiveGroup(group.id)"
            @dragover.prevent="handleGroupDragOver(group.id)"
            @drop="handleGroupDrop($event, group.id)"
            :class="[
              'flex items-center gap-1.5 px-2 py-1 rounded border transition cursor-pointer group/header',
              dragOverGroupId === group.id
                ? 'bg-blue-100 border-blue-300'
                : activeGroupId === group.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            ]"
          >
            <!-- Group Name Edit Mode -->
            <div v-if="editingGroupId === group.id" class="flex-1 flex gap-1" @click.stop>
              <input
                v-model="editingGroupName"
                type="text"
                class="flex-1 p-1 text-gray-900 placeholder-gray-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                autofocus
                @keyup.enter="handleSaveGroupEdit(group.id)"
                @keyup.escape="handleCancelGroupEdit"
              />
              <button
                @click.stop="handleSaveGroupEdit(group.id)"
                class="px-1.5 py-0.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
              >
                <i class="i-pixelarticons:check w-3 h-3" />
              </button>
              <button
                @click.stop="handleCancelGroupEdit"
                class="px-1.5 py-0.5 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs"
              >
                <i class="i-pixelarticons:close w-3 h-3" />
              </button>
            </div>

            <!-- Group Name View Mode -->
            <template v-else>
              <i class="i-pixelarticons:folder w-4 h-4 flex-shrink-0" :class="activeGroupId === group.id ? 'text-blue-500' : 'text-gray-500'" />
              <p
                @dblclick.stop="handleStartEditGroup(group.id, group.name)"
                class="flex-1 text-xs font-medium truncate"
                :class="activeGroupId === group.id ? 'text-blue-900' : 'text-gray-700'"
              >
                {{ group.name }}
              </p>
              <span class="text-xs text-gray-500">
                ({{ getGroupTodoCount(group.id) }})
              </span>

              <!-- Delete Button -->
              <button
                @click.stop="handleDeleteGroup(group.id)"
                class="p-1 opacity-0 text-red-600 hover:text-red-700 rounded transition group-hover/header:opacity-100 flex-shrink-0"
              >
                <i class="i-pixelarticons:trash w-3 h-3" />
              </button>
            </template>
          </div>

          <!-- Todos in Active Group Only -->
          <div v-if="activeGroupId === group.id" class="space-y-0.5 pl-2">
            <div
              v-for="(todo, index) in getGroupTodos(group.id)"
              :key="todo.id"
              draggable="true"
              @dragstart="handleTodoDragStart($event, todo)"
              @dragover="handleTodoDragOver($event, todo)"
              @drop="handleTodoDrop($event, todo)"
              @dragend="handleTodoDragEnd"
              @dragleave="dragOverTodoId = null"
              :class="[
                'flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded hover:bg-gray-100 transition group border border-gray-200 text-xs',
                draggedTodoId === todo.id ? 'opacity-50 bg-blue-100' : '',
                dragOverTodoId === todo.id ? 'border-2 border-blue-400 bg-blue-50' : ''
              ]"
            >
              <!-- Edit Mode -->
              <div v-if="editingTodoId === todo.id" class="flex-1 flex gap-1">
                <input
                  v-model="editingTodoText"
                  type="text"
                  class="flex-1 p-1 text-gray-900 placeholder-gray-400 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autofocus
                  @keyup.enter="handleSaveEdit(todo.id)"
                  @keyup.escape="handleCancelEdit"
                />
                <button
                  @click="handleSaveEdit(todo.id)"
                  class="px-1.5 py-0.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs"
                >
                  <i class="i-pixelarticons:check w-3 h-3" />
                </button>
                <button
                  @click="handleCancelEdit"
                  class="px-1.5 py-0.5 bg-gray-400 hover:bg-gray-500 text-white rounded text-xs"
                >
                  <i class="i-pixelarticons:close w-3 h-3" />
                </button>
              </div>

              <!-- View Mode -->
              <template v-else>
                <!-- Drag Handle -->
                <div class="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 transition">
                  <i class="i-pixelarticons:sort w-3 h-3" />
                </div>

                <!-- Checkbox -->
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="todoStore.toggleTodo(todo.id)"
                  class="w-4 h-4 cursor-pointer flex-shrink-0"
                />

                <!-- Todo Text -->
                <div class="flex-1 min-w-0">
                  <p
                    @dblclick="handleStartEdit(todo.id, todo.title)"
                    :class="[
                      'text-xs transition truncate cursor-text',
                      todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
                    ]"
                    :title="todo.title"
                  >
                    {{ todo.title }}
                  </p>
                </div>

                <!-- Delete Button -->
                <button
                  @click="todoStore.deleteTodo(todo.id)"
                  class="p-1 opacity-0 text-red-600 hover:text-red-700 rounded transition group-hover:opacity-100 flex-shrink-0"
                >
                  <i class="i-pixelarticons:trash w-3 h-3" />
                </button>
              </template>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Buttons -->
    <div class="p-3 border-t border-[var(--color-border)]">
      <div class="flex gap-2">
        <button
          @click="handleNewTask"
          :disabled="!activeGroupId || editingTodoId !== null || editingGroupId !== null"
          class="flex-1 px-2 py-1 rounded font-medium text-xs flex items-center justify-center gap-1 transition"
          :class="(activeGroupId && editingTodoId === null && editingGroupId === null)
            ? 'btn' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
        >
          <i class="i-pixelarticons:plus w-3 h-3" />
          <span>{{ t('todos.task') }}</span>
        </button>
        <button
          @click="handleNewGroup"
          :disabled="editingTodoId !== null || editingGroupId !== null"
          class="flex-1 px-2 py-1 rounded font-medium text-xs flex items-center justify-center gap-1 transition"
          :class="(editingTodoId === null && editingGroupId === null)
            ? 'btn' 
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'"
        >
          <i class="i-pixelarticons:folder w-3 h-3" />
          <span>{{ t('todos.group') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Todo } from '../stores/todolist'
import { useTodoStore } from '../stores/todolist'

const { t } = useI18n()
const todoStore = useTodoStore()

// State
const editingTodoId = ref<string | null>(null)
const editingTodoText = ref('')
const editingGroupId = ref<string | null>(null)
const editingGroupName = ref('')
const activeGroupId = ref<string | null>(null)
const draggedTodoId = ref<string | null>(null)
const dragOverTodoId = ref<string | null>(null)
const dragOverGroupId = ref<string | null>(null)

// Computed
const allGroups = computed(() => {
  const groups = [...todoStore.groups].sort((a, b) => a.order - b.order)
  if (activeGroupId.value === null && groups.length > 0) {
    activeGroupId.value = groups[0]?.id || null
  }
  return groups
})

// Methods
const getGroupTodos = (groupId: string | null): Todo[] => {
  return todoStore.todos
    .filter(t => t.groupId === groupId)
    .sort((a, b) => a.order - b.order)
}

const getGroupTodoCount = (groupId: string): number => {
  return getGroupTodos(groupId).length
}

const setActiveGroup = (groupId: string) => {
  activeGroupId.value = activeGroupId.value === groupId ? null : groupId
}

// Todo Drag and Drop (within same group)
const handleTodoDragStart = (event: DragEvent, todo: Todo) => {
  draggedTodoId.value = todo.id
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleTodoDragOver = (event: DragEvent, todo: Todo) => {
  event.preventDefault()
  dragOverTodoId.value = todo.id
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleGroupDragOver = (groupId: string) => {
  dragOverGroupId.value = groupId
}

const handleGroupDrop = (event: DragEvent, groupId: string) => {
  event.preventDefault()
  if (draggedTodoId.value) {
    const draggedTodo = todoStore.todos.find(t => t.id === draggedTodoId.value)
    if (draggedTodo && draggedTodo.groupId !== groupId) {
      todoStore.moveTodoToGroup(draggedTodoId.value, groupId)
      activeGroupId.value = groupId
    }
  }
  draggedTodoId.value = null
  dragOverGroupId.value = null
  dragOverTodoId.value = null
}

const handleTodoDrop = (event: DragEvent, targetTodo: Todo) => {
  event.preventDefault()
  
  if (draggedTodoId.value !== null && draggedTodoId.value !== targetTodo.id) {
    const groupId = targetTodo.groupId
    const groupTodos = getGroupTodos(groupId)
    const fromIndex = groupTodos.findIndex((t: Todo) => t.id === draggedTodoId.value)
    const toIndex = groupTodos.findIndex((t: Todo) => t.id === targetTodo.id)
    
    if (fromIndex !== -1 && toIndex !== -1) {
      todoStore.reorderTodos(groupId, fromIndex, toIndex)
    } else if (groupId !== null) {
      todoStore.moveTodoToGroup(draggedTodoId.value, groupId)
    }
    draggedTodoId.value = null
    dragOverTodoId.value = null
  }
}

const handleTodoDragEnd = () => {
  draggedTodoId.value = null
  dragOverTodoId.value = null
  dragOverGroupId.value = null
}

// New Task / Group
const handleNewTask = () => {
  if (!activeGroupId.value) return
  
  const newTodo = todoStore.addTodo('', activeGroupId.value)
  editingTodoId.value = newTodo.id
  editingTodoText.value = ''
}

const handleNewGroup = () => {
  const newGroup = todoStore.addGroup('New Group')
  editingGroupId.value = newGroup.id
  editingGroupName.value = newGroup.name
  activeGroupId.value = newGroup.id
}

// Edit Todo
const handleStartEdit = (todoId: string, currentTitle: string) => {
  editingTodoId.value = todoId
  editingTodoText.value = currentTitle
}

const handleSaveEdit = (todoId: string) => {
  if (editingTodoText.value.trim()) {
    todoStore.updateTodo(todoId, editingTodoText.value.trim())
  } else {
    todoStore.deleteTodo(todoId)
  }
  
  editingTodoId.value = null
  editingTodoText.value = ''
}

const handleCancelEdit = () => {
  if (editingTodoId.value && editingTodoText.value.trim() === '') {
    const todo = todoStore.todos.find(t => t.id === editingTodoId.value)
    if (todo && todo.title === '') {
      todoStore.deleteTodo(editingTodoId.value)
    }
  }
  
  editingTodoId.value = null
  editingTodoText.value = ''
}

// Edit Group
const handleStartEditGroup = (groupId: string, currentName: string) => {
  editingGroupId.value = groupId
  editingGroupName.value = currentName
}

const handleSaveGroupEdit = (groupId: string) => {
  if (editingGroupName.value.trim()) {
    todoStore.updateGroup(groupId, editingGroupName.value.trim())
  }
  
  editingGroupId.value = null
  editingGroupName.value = ''
}

const handleCancelGroupEdit = () => {
  editingGroupId.value = null
  editingGroupName.value = ''
}

const handleDeleteGroup = (groupId: string) => {
  todoStore.deleteGroup(groupId)
  // 濡傛灉鍒犻櫎鐨勬槸娲昏穬缁勶紝鍒囨崲鍒板叾浠栫粍
  if (activeGroupId.value === groupId) {
    activeGroupId.value = allGroups.value.length > 0 ? (allGroups.value[0]?.id || null) : null
  }
}
</script>

<style scoped>
</style>
