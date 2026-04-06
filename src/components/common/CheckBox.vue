<template>
  <button
    @click="toggle"
    class="relative inline-flex items-center justify-center p-0 bg-transparent focus:outline-none transition-transform duration-150 active:scale-95"
    :aria-pressed="isEnabled"
  >
    <div
      :class="[
        'relative w-6 h-6 border-2 border-solid border-[#662800] transition-all duration-200 flex items-center justify-center'
      ]"
    >
      <span
        v-if="isEnabled"
        class="absolute inset-0 flex items-center justify-center text-[#27c01f] font-bold text-2xl"
      ><i class="i-pixelarticons:check"></i></span>
    </div>
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isEnabled = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  isEnabled.value = newValue
})

watch(isEnabled, (newValue) => {
  emit('update:modelValue', newValue)
  emit('change', newValue)
})

const toggle = () => {
  isEnabled.value = !isEnabled.value
}
</script>