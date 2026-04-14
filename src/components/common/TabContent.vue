<script lang="ts" setup>
import { TabsContent } from 'radix-vue'

interface Props {
  value: string
}

defineProps<Props>()
</script>

<template>
  <TabsContent :value class="mt-4 focus:outline-none">
    <slot />
  </TabsContent>
</template>
