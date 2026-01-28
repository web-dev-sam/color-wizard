<script lang="ts" setup>
import type { Color } from "culori"
import { Icon } from "@iconify/vue"
import { formatRgb, wcagContrast } from "culori"
import { computed } from "vue"
import { lrgbWhite } from "../../utils/colors"
import UiButton from "../ui/button/Button.vue"
import UiTooltip from "../ui/tooltip/Tooltip.vue"
import UiTooltipContent from "../ui/tooltip/TooltipContent.vue"
import UiTooltipTrigger from "../ui/tooltip/TooltipTrigger.vue"

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
    <div v-if="isContrastValid" class="flex text-green-400 4ade80 gap-2 items-center justify-center" :class="{ 'text-yellow-400': contrastRange[0] < 4.5 }">
      <Icon icon="ph:check" size="18" />
      <span>Pass{{ contrastRange[0] < 4.5 ? " for large text" : "" }} ({{ contrast.toFixed(2) }} : 1)</span>
      <UiTooltip>
        <UiTooltipTrigger as-child>
          <UiButton variant="ghost" class="text-yellow-400 p-1 cursor-help hover:text-yellow-300 -translate-x-1">
            <Icon v-if="contrastRange[0] < 4.5" icon="ph:info" size="18" />
          </UiButton>
        </UiTooltipTrigger>
        <UiTooltipContent>
          <p>WCAG 2.1 recommends a contrast ratio of at least 3:1 for large text (14 point bold or 18 point regular) and 4.5:1 for normal text.</p>
        </UiTooltipContent>
      </UiTooltip>
    </div>
    <div v-else-if="!isValid" class="text-red-400 flex gap-2 items-center">
      <Icon icon="ph:x" size="18" />
      <span>Fail (Not a color)</span>
    </div>
    <div v-else class="text-red-400 flex gap-2 items-center">
      <Icon icon="ph:x" size="18" />
      <span>Fail ({{ contrast.toFixed(2) }} : 1)</span>
    </div>
  </div>
</template>
