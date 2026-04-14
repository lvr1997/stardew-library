<template>
  <PopoverRoot>
    <PopoverTrigger class="p-0 bg-transparent text-white/90 data-[state=open]:text-white">
      <slot name="button">
        <img src="../../assets/icons/settings_Button.png" alt="settings_Button">
      </slot>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent side="bottom" align="center" :side-offset="8"
        class="popover z-10 h-auto min-w-xs px-4 sm:px-0 lg:max-w-3xl data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out">
        <div
          :class="[
            'popover z-10 h-auto min-w-xs px-4 sm:px-0 lg:max-w-3xl',
            'data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out',
          ]"
        >
          <slot />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'radix-vue'
</script>

<style scoped>
.popover {
  border: 12px solid transparent;
  border-image: url(../../assets/themes/border.png) 15 stretch;
  background: #fbc16b;
  box-shadow: none;
  border-radius: 15px;
}
</style>
