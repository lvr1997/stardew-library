<script lang="ts" setup>
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'radix-vue'

export interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  defaultValue?: string
}

withDefaults(defineProps<Props>(), {
  defaultValue: undefined,
})
</script>

<template>
  <TabsRoot 
    :default-value="defaultValue || tabs[0]?.id" 
    class="flex flex-col w-full"
  >
    <TabsList
      class="flex gap-1 border-b-2 border-[#5e2c2a]/20 bg-transparent"
      aria-label="Settings tabs"
    >
      <TabsTrigger
        v-for="tab in tabs"
        :key="tab.id"
        :value="tab.id"
        class="px-4 py-2 text-sm font-medium text-[#5e2c2a] hover:opacity-80 data-[state=active]:font-bold data-[state=inactive]:opacity-60 focus:outline-none"
      >
        {{ tab.label }}
      </TabsTrigger>
    </TabsList>
    <slot />
  </TabsRoot>
</template>
