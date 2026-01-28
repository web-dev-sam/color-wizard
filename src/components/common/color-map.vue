<script lang="ts" setup>
import type { Hsl } from "culori"
import { formatHsl } from "culori"
import { ref } from "vue"
import { cn } from "../../utils/cn"

defineProps<{
  suggestionMap: {
    contrasts: string[]
    colors: Record<string, Hsl[]>
    autoSelectedColor: Hsl | undefined
  }
}>()

const hoveredColor = ref<Hsl | undefined>(undefined)
const selectedColor = defineModel<Hsl>({ required: true })
</script>

<template>
  <div v-for="contrast of suggestionMap.contrasts" :key="contrast" class="flex">
    <div v-for="(color, i) of suggestionMap.colors[contrast]" :key="i">
      <div
        class="w-2 h-2 relative group" :style="{ backgroundColor: formatHsl(color) }"
        @mouseover="hoveredColor = color"
        @mouseleave="hoveredColor = undefined"
        @click="() => selectedColor = color"
      >
        <div
          :class="cn(
            'w-4 h-4 absolute hidden -translate-x-1/2 -translate-y-1/2 top-1 left-1 border border-white group-hover:block pointer-events-none z-10',
            { 'block border-2': formatHsl(selectedColor) === formatHsl(color) },
          )"
          :style="{ backgroundColor: formatHsl(color) }"
        >
        </div>
      </div>
    </div>
  </div>
</template>
