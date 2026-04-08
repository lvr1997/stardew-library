<template>
  <label class="relative inline-flex items-center justify-center cursor-pointer w-5 h-5">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="handleChange"
      class="peer sr-only"
    />
    <img
      :src="checkboxImg"
      alt=""
      class="w-5 h-5 max-w-none object-cover"
      :style="{ objectPosition: modelValue ? 'right center' : 'left center' }"
    />
  </label>
</template>

<script setup>
import checkboxImg from '@/assets/icons/checkbox.png'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const handleChange = (event) => {
  const checked = event.target.checked
  emit('update:modelValue', checked)
  emit('change', checked)
}
</script>