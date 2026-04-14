<script setup lang="ts">
import { computed } from 'vue'
import {
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from 'radix-vue'

const props = withDefaults(defineProps<{
  modelValue: string[]
  max?: number
  placeholder?: string
  helperText?: string
  clearText?: string
  delimiter?: string
  maxLength?: number
}>(), {
  max: 0,
  placeholder: '',
  helperText: '',
  clearText: 'Clear',
  delimiter: ',',
  maxLength: 40,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', value),
})
</script>

<template>
  <TagsInputRoot
    v-model="internalValue"
    class="tags-root"
    :max="max || undefined"
    :delimiter="delimiter"
    add-on-paste
  >
    <div class="tags-list">
      <TagsInputItem
        v-for="tag in internalValue"
        :key="tag"
        :value="tag"
        class="task-tag"
      >
        <TagsInputItemText class="task-tag-text" />
        <TagsInputItemDelete class="task-tag-delete">
          <i class="i-pixelarticons:close" />
        </TagsInputItemDelete>
      </TagsInputItem>

      <TagsInputInput
        class="tags-input"
        :placeholder="placeholder"
        :max-length="maxLength"
      />
    </div>

    <div v-if="helperText || clearText" class="mt-2 flex items-center justify-between gap-2">
      <p class="helper-text">{{ helperText }}</p>
      <TagsInputClear class="clear-btn">
        {{ clearText }}
      </TagsInputClear>
    </div>
  </TagsInputRoot>
</template>

<style scoped>
.tags-root {
  border: 2px solid #a1692c;
  border-radius: 8px;
  background: rgba(255, 248, 228, 0.92);
  padding: 8px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.task-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 2px solid #8d5c24;
  border-radius: 999px;
  background: rgba(215, 128, 4, 0.14);
  padding: 6px 8px;
  color: #5e2c2a;
}

.task-tag-text {
  font-size: 11px;
}

.task-tag-delete {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(124, 74, 30, 0.12);
}

.tags-input {
  min-width: 140px;
  flex: 1;
  border: 0;
  background: transparent;
  padding: 6px 4px;
  color: #5e2c2a;
  outline: none;
}

.helper-text {
  font-size: 10px;
  color: #7a5430;
}

.clear-btn {
  border: 2px solid #7c4a1e;
  border-radius: 8px;
  background: rgba(255, 248, 228, 0.7);
  padding: 4px 8px;
  font-size: 10px;
  color: #5e2c2a;
}
</style>
