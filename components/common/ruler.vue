<script setup lang="ts">
import { computed } from "vue"

interface Props {
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 4.5,
  max: 4.7,
})

const calculateStep = (min: number, max: number): number => {
  const range = max - min
  const steps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.5, 1, 2, 3, 4, 5, 8, 10]
  return steps.find(step => range / step <= 7) || 0.05
}

const step = computed(() => calculateStep(props.min, props.max))

const ticks = computed(() => {
  const count = Math.floor((props.max - props.min) / step.value) + 2
  return Array.from({ length: count }, (_, i) => props.min + i * step.value)
})

const formatNumber = (num: number): string => {
  return num.toFixed(2).replace(/\.?0+$/, "")
}
</script>

<template>
  <div class="flex items-center">
    <div class="relative h-full w-12">
      <div class="absolute top-0 bottom-0 left-0 border-l"></div>
      <div
        v-for="(tick, index) in ticks"
        :key="index"
        class="absolute left-0 translate-y-1/2 flex items-center"
        :style="{
          bottom: `${(index / (ticks.length - 1)) * 100}%`,
        }"
      >
        <div class="w-2 border-t"></div>
        <span class="ml-1 text-sm">{{ formatNumber(tick) }}</span>
      </div>
    </div>
  </div>
</template>
