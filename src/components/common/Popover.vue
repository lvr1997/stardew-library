<template>
    <Popover v-slot="{ open }" class="relative">
        <PopoverButton :class="open ? 'text-white' : 'text-white/90'" class="p-0">
            <img src="../../assets/icons/settings_Button.png" alt="settings_Button">
        </PopoverButton>
        <transition enter-active-class="transition duration-200 ease-out" enter-from-class="translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
                    leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-1 opacity-0">
            <PopoverPanel class="popover absolute left-1/2 z-10 mt-2 h-auto min-w-xs min-h-xs -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl">
                <slot></slot>
            </PopoverPanel>
        </transition>
    </Popover>
</template>

<script setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';

</script>

<style scoped>
.popover {
  border: 12px solid transparent;
  border-image: url(../../assets/themes/default/border.png) 15 stretch;
  background: #fbc16b;
  box-shadow: none;
  border-radius: 15px;
}
</style>