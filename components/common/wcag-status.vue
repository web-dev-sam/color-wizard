<script lang="ts" setup>
import { type Color, formatRgb, wcagContrast } from "culori"

const props = defineProps<{
  color: Color | string
  contrastRange: [number, number]
}>()

const isValid = computed(() => formatRgb(props.color) !== undefined)
const contrast = computed(() => wcagContrast(props.color, lrgbWhite))
const isContrastValid = computed(() => isValid.value && contrast.value >= props.contrastRange[0] && contrast.value <= props.contrastRange[1])
</script>

<template>
  <div>
    <div v-if="isContrastValid" class="flex text-green-400 gap-2 items-center" :class="{ 'text-yellow-400': contrastRange[0] < 4.5 }">
      <Icon name="ph:check" size="18" />
      <span>Pass{{ contrastRange[0] < 4.5 ? " for large text" : "" }} ({{ contrast.toFixed(2) }} : 1)</span>
      <Icon v-if="contrastRange[0] < 4.5" name="ph:info" size="18" title="WCAG 2.1 recommends a contrast ratio of at least 3:1 for large text (14 point bold or 18 point regular) and 4.5:1 for normal text." />
    </div>
    <div v-else-if="!isValid" class="text-red-400 flex gap-2 items-center">
      <Icon name="ph:x" size="18" />
      <span>Fail  (Not a color)</span>
    </div>
    <div v-else class="text-red-400 flex gap-2 items-center">
      <Icon name="ph:x" size="18" />
      <span>Fail  ({{ contrast.toFixed(2) }} : 1)</span>
    </div>
  </div>
</template>
