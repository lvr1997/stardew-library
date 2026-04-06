import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Group {
  id: string
  name: string
  order: number
  createdAt: number
}

export interface Todo {
  id: string
  title: string
  completed: boolean
  groupId: string | null
  createdAt: number
  order: number
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const groups = ref<Group[]>([])

  // 浠巐ocalStorage鍔犺浇鏁版嵁
  const loadTodos = () => {
    const stored = localStorage.getItem('todos')
    if (stored) {
      todos.value = JSON.parse(stored)
    }
  }

  // 浠巐ocalStorage鍔犺浇鍒嗙粍
  const loadGroups = () => {
    const stored = localStorage.getItem('groups')
    if (stored) {
      groups.value = JSON.parse(stored)
    }
  }

  // 淇濆瓨鍒發ocalStorage
  const saveTodos = () => {
    localStorage.setItem('todos', JSON.stringify(todos.value))
  }

  // 淇濆瓨鍒嗙粍鍒發ocalStorage
  const saveGroups = () => {
    localStorage.setItem('groups', JSON.stringify(groups.value))
  }

  const addTodo = (title: string, groupId: string | null = null) => {
    const groupTodos = todos.value.filter(t => t.groupId === groupId)
    const maxOrder = groupTodos.length > 0 ? Math.max(...groupTodos.map(t => t.order)) : -1
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false,
      groupId,
      createdAt: Date.now(),
      order: maxOrder + 1
    }
    todos.value.push(newTodo)
    saveTodos()
    return newTodo
  }

  const toggleTodo = (id: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
      saveTodos()
    }
  }

  const deleteTodo = (id: string) => {
    todos.value = todos.value.filter(t => t.id !== id)
    saveTodos()
  }

  const updateTodo = (id: string, title: string) => {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      todo.title = title
      saveTodos()
    }
  }

  const moveTodoToGroup = (id: string, targetGroupId: string | null) => {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) return

    todo.groupId = targetGroupId
    const targetTodos = todos.value.filter(t => t.groupId === targetGroupId)
    const maxOrder = targetTodos.length > 0 ? Math.max(...targetTodos.map(t => t.order)) : -1
    todo.order = maxOrder + 1
    saveTodos()
  }

  const reorderTodos = (groupId: string | null, fromIndex: number, toIndex: number) => {
    const groupTodos = todos.value
      .filter(t => t.groupId === groupId)
      .sort((a, b) => a.order - b.order)

    if (fromIndex < 0 || fromIndex >= groupTodos.length || toIndex < 0 || toIndex >= groupTodos.length) {
      return
    }

    // 绉诲姩鍏冪礌
    const movedTodo = groupTodos[fromIndex]
    if (!movedTodo) return
    
    groupTodos.splice(fromIndex, 1)
    groupTodos.splice(toIndex, 0, movedTodo)

    // 鏇存柊鎵€鏈?order 鍊?
    groupTodos.forEach((todo, idx) => {
      const realTodo = todos.value.find(t => t.id === todo.id)
      if (realTodo) {
        realTodo.order = idx
      }
    })

    saveTodos()
  }

  // 鎺掑簭 groups
  const reorderGroups = (fromIndex: number, toIndex: number) => {
    const orderedGroups = groups.value.sort((a, b) => a.order - b.order)

    if (fromIndex < 0 || fromIndex >= orderedGroups.length || toIndex < 0 || toIndex >= orderedGroups.length) {
      return
    }

    // 绉诲姩鍏冪礌
    const movedGroup = orderedGroups[fromIndex]
    if (!movedGroup) return
    
    orderedGroups.splice(fromIndex, 1)
    orderedGroups.splice(toIndex, 0, movedGroup)

    // 鏇存柊鎵€鏈?order 鍊?
    orderedGroups.forEach((group, idx) => {
      const realGroup = groups.value.find(g => g.id === group.id)
      if (realGroup) {
        realGroup.order = idx
      }
    })

    saveGroups()
  }

  // Group 鐩稿叧鏂规硶
  const addGroup = (name: string) => {
    const maxOrder = groups.value.length > 0 ? Math.max(...groups.value.map(g => g.order)) : -1
    
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      order: maxOrder + 1,
      createdAt: Date.now()
    }
    groups.value.push(newGroup)
    saveGroups()
    return newGroup
  }

  const updateGroup = (id: string, name: string) => {
    const group = groups.value.find(g => g.id === id)
    if (group) {
      group.name = name
      saveGroups()
    }
  }

  const deleteGroup = (id: string) => {
    // 鍒犻櫎鍒嗙粍鏃讹紝灏嗚鍒嗙粍涓嬬殑todos鐨刧roupId璁句负null
    todos.value.forEach(todo => {
      if (todo.groupId === id) {
        todo.groupId = null
      }
    })
    groups.value = groups.value.filter(g => g.id !== id)
    saveGroups()
    saveTodos()
  }

  const getTodosByGroup = (groupId: string) => {
    return todos.value.filter(t => t.groupId === groupId).sort((a, b) => a.order - b.order)
  }

  return {
    todos,
    groups,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    moveTodoToGroup,
    reorderTodos,
    reorderGroups,
    addGroup,
    updateGroup,
    deleteGroup,
    getTodosByGroup,
    loadTodos,
    saveTodos,
    loadGroups,
    saveGroups
  }
})
