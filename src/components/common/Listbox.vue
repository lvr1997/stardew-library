<template>
  <Listbox v-model="internalValue">
    <div class="relative mt-1">
      <ListboxButton class="relative py-1 pl-3 pr-10 input-base whitespace-nowrap">
        <span class="block truncate">{{ displayLabel(selectedLabel, internalValue) }}</span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"">
         <i class=" i-pixelarticons:chevron-down" />
        </span>

      </ListboxButton>

      <transition leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <ListboxOptions class="absolute z-36 max-h-60 w-auto overflow-auto py-1 input-base sm:text-sm">
          <ul>
            <ListboxOption v-for="option in options" :key="optionKey(option)" :value="option" :disabled="optionDisabled(option)" v-slot="{ active, selected, disabled }">
              <li :class="[
                active ? 'bg-[#f6dfb4] text-[#]' : 'text-[#5e2c2a]',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-default',
                'relative select-none py-2 pl-10 pr-4',
              ]">
                <span :class="[
                  selected ? 'font-medium' : 'font-normal',
                  'block truncate',
                ]">
                  {{ displayLabel(optionLabel(option), option) }}
                </span>
                <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-[#5e2c2a]">
                  ✓
                </span>
              </li>
            </ListboxOption>
          </ul>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script setup>
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

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
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();
const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const optionLabel = (option) =>
  option && typeof option === 'object' ? option[props.labelKey] : String(option ?? '');

const optionNameKey = (option) =>
  option && typeof option === 'object' ? option[props.nameKey] : null;

const optionKey = (option) =>
  option && typeof option === 'object' ? option[props.keyField] ?? optionLabel(option) : option;

const optionDisabled = (option) =>
  option && typeof option === 'object' ? Boolean(option[props.disabledKey]) : false;

const displayLabel = (label, option = null) => {
  if (!props.useTranslation) return label;

  // Try to get translation key from option if available
  if (option && optionNameKey(option)) {
    const translationKey = optionNameKey(option);
    const translated = t(translationKey);
    if (translated !== translationKey) {
      return translated;
    }
  }

  // Fallback to original label
  return label;
};

const selectedLabel = computed(() => {
  if (internalValue.value == null) return props.placeholder;
  return optionLabel(internalValue.value);
});
</script>
