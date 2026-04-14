<template>
  <SelectRoot :model-value="selectedKey" @update:model-value="handleValueChange">
    <div class="relative mt-1">
      <SelectTrigger class="relative py-1 pl-3 pr-10 input-base whitespace-nowrap text-left">
        <span class="block truncate">{{ selectedLabel }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <i class="i-pixelarticons:chevron-down" />
        </span>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          class="z-36 max-h-60 w-auto overflow-auto py-1 input-base sm:text-sm data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out"
        >
          <SelectViewport>
            <SelectItem
              v-for="option in options"
              :key="optionKey(option)"
              :value="String(optionKey(option))"
              :disabled="optionDisabled(option)"
              :class="[
                'relative block select-none py-2 pl-10 pr-4 text-[#5e2c2a] outline-none',
                'data-[highlighted]:bg-[#f6dfb4] data-[highlighted]:text-[#5e2c2a]',
                'data-[state=checked]:bg-[#f1c265] data-[state=checked]:font-medium',
                optionDisabled(option) ? 'opacity-50 cursor-not-allowed' : 'cursor-default',
              ]"
            >
              <SelectItemText class="block truncate">
                {{ displayLabel(optionLabel(option), option) }}
              </SelectItemText>
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5e2c2a]">
                <SelectItemIndicator>✓</SelectItemIndicator>
              </span>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </div>
  </SelectRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from 'radix-vue'

const props = defineProps({
  modelValue: {
    type: [Object, String, Number, Boolean, null],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  labelKey: {
    type: String,
    default: 'name',
  },
  nameKey: {
    type: String,
    default: 'nameKey',
  },
  keyField: {
    type: String,
    default: 'id',
  },
  disabledKey: {
    type: String,
    default: 'unavailable',
  },
  placeholder: {
    type: String,
    default: 'Select',
  },
  useTranslation: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()

const optionLabel = (option: any) =>
  option && typeof option === 'object' ? option[props.labelKey] : String(option ?? '')

const optionNameKey = (option: any) =>
  option && typeof option === 'object' ? option[props.nameKey] : null

const optionKey = (option: any) =>
  option && typeof option === 'object' ? option[props.keyField] ?? optionLabel(option) : option

const optionDisabled = (option: any) =>
  option && typeof option === 'object' ? Boolean(option[props.disabledKey]) : false

const displayLabel = (label: string, option: any = null) => {
  if (!props.useTranslation) return label

  if (option && optionNameKey(option)) {
    const translationKey = optionNameKey(option)
    const translated = t(translationKey)
    if (translated !== translationKey) {
      return translated
    }
  }

  return label
}

const selectedKey = computed(() => {
  if (props.modelValue == null) return ''
  return String(optionKey(props.modelValue))
})

const selectedLabel = computed(() => {
  if (props.modelValue == null) return props.placeholder
  return displayLabel(optionLabel(props.modelValue), props.modelValue)
})

const handleValueChange = (value: string) => {
  const selectedOption = props.options.find((option: any) => String(optionKey(option)) === value)
  emit('update:modelValue', selectedOption ?? value)
}
</script>
