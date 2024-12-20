<script setup lang="ts">
import { differenceEuclidean, formatHex, formatHsl, hsl, type Hsl, wcagContrast } from "culori"

const colorInput = ref("#0d1117")// "#0d1117")
const colorIsValid = computed(() => formatHsl(colorInput.value) !== undefined)
const selectedColor = ref<Hsl | undefined>(undefined)
const hoveredColor = ref<Hsl | undefined>(undefined)
const minContrast = ref(4.5)
const maxContrast = ref(4.8)
const contrastMode = ref<"auto" | "light" | "dark">("auto")

const themeColor = computed(() => selectedColor.value ?? toHsl(colorInput.value))
const themeColorContrast = computed(() => themeColor.value ? wcagContrast(themeColor.value, lrgbWhite) : 21)
const themeBgFgCss = computed(() => ({
  backgroundColor: formatHsl(themeColor.value),
  color: contrastMode.value === "auto"
    ? themeColorContrast.value < 4.5
      ? "#000"
      : "#fff"
    : contrastMode.value === "light"
      ? "#fff"
      : "#000",
}))

const contrastColors = computed(
  () => def(findHSLColorsWithContrast(colorInput.value, 24, minContrast.value, maxContrast.value, 0.7, contrastMode.value),
    {
      ColorParserError: undefined,
    },
  ),
)
const suggestionMap = computed(() => contrastColors.value.data ? createColorMap(contrastColors.value.data) : undefined)
const backgroundColor = hsl({ h: 0.2, s: 0.14, l: 0.04, mode: "hsl" })

function createColorMap(colors: Hsl[]) {
  type WCAGContrastKey = string & { __wcagContrastKey: never }
  const hueSort = (a: Hsl, b: Hsl) => (a.h ?? 0) - (b.h ?? 0)
  const groupWcag = (colors: Hsl[]) => groupBy<WCAGContrastKey, Hsl>(colors, c => wcagContrast(c, {
    auto: "#fff",
    light: "#fff",
    dark: "#000",
  }[contrastMode.value]).toFixed(2) as WCAGContrastKey)

  const wcagGroupedColors = groupWcag(colors)
  for (let i = minContrast.value; i <= maxContrast.value; i += 0.01) {
    if (!wcagGroupedColors[i.toFixed(2) as WCAGContrastKey]) {
      wcagGroupedColors[i.toFixed(2) as WCAGContrastKey] = [backgroundColor]
    }
  }

  const getDifference = (c: Hsl) => differenceEuclidean()(c, colorInput.value)
  let autoSelectedColor: Hsl | undefined
  let autoSelectedColorDifference = Infinity
  for (const [_contrast, contrastColors] of Object.entries(wcagGroupedColors)) {
    contrastColors.sort(hueSort)
    for (const color of contrastColors) {
      const difference = getDifference(color)
      if (difference < autoSelectedColorDifference && color !== backgroundColor) {
        autoSelectedColor = color
        autoSelectedColorDifference = difference
      }
    }
  }
  if (autoSelectedColor) {
    selectColor(autoSelectedColor)
  }

  return {
    contrasts: Object
      .keys(wcagGroupedColors)
      .sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a)) as (keyof typeof wcagGroupedColors)[],
    colors: wcagGroupedColors,
    autoSelectedColor,
  }
}

function resetColor() {
  selectedColor.value = suggestionMap.value?.autoSelectedColor ? suggestionMap.value?.autoSelectedColor : undefined
}

function selectColor(color: Hsl | undefined) {
  selectedColor.value = color
}
</script>

<template>
  <div class="container text-center mt-32">
    <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
      Choose your base color.
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
      This is the base of your palette. It should have a good contrast ratio with the background.
    </p>

    <div class="flex justify-center items-center gap-2">
      <UiButton
        variant="ghost"
        @click="resetColor"
      >
        <Icon name="ph:repeat" size="18"></Icon>
      </UiButton>
      <UiInput v-model="colorInput" class="inline-block" type="text" placeholder="#B000BA" :style="{ '--ring': colorIsValid ? formatHsl(colorInput) : 'red', 'border-red-500': !colorIsValid }" />
      <UiButton
        v-if="colorIsValid"
        :style="{ ...themeBgFgCss }"
      >
        Select <span class="ml-2 font-mono">{{ formatHex(themeColor) }}</span>
      </UiButton>
    </div>
    <UiButton
      v-if="colorIsValid"
      variant="ghost"
      class="mt-2 group"
    >
      Use <span class="mx-2 font-mono">{{ formatHex(colorInput) }}</span> <span class="saturate-0 scale-105 group-hover:saturate-50 group-hover:hue-rotate-30">🥴</span>
    </UiButton>

    <!-- Color Display -->
    <div class="mt-16 flex justify-evenly">
      <div v-if="!colorIsValid" class="text-gray-600 dark:text-gray-400 w-[50ch] leading-8">
        <div class="mb-2">Examples</div>
        <code>#b000ba</code>,
        <code>#bbc</code>,
        <code>firebrick</code>,
        <code>hsl(0, 100%, 50%)</code>,
        <code>rgb(255 0 0)</code>,
        <code>rgba(255, 0, 0, 0.5)</code>,
        <code>hwb(0 0 0)</code>,
        <code>lab(30% 40 20)</code>,
        <code>lch(50% 10 250)</code>
      </div>
      <div v-else class="flex gap-4 pt-2 pb-4 pr-2">
        <div class="flex w-10 pb-2 flex-col items-center text-gray-600 dark:text-gray-400">
          <div class="tracking-tight text-sm pointer-events-none">
            WCAG
          </div>
          <div class="flex-1"></div>
          <UiButton
            variant="ghost"
            class="px-2"
            :style="{ color: contrastMode === 'auto' ? formatHsl(themeColor) : '' }"
            @click="contrastMode = 'auto'"
          >
            <Icon name="ph:lightning-a" size="18"></Icon>
          </UiButton>
          <UiButton
            variant="ghost"
            class="px-2"
            :style="{ color: contrastMode === 'light' ? formatHsl(themeColor) : '' }"
            @click="contrastMode = 'light'"
          >
            <Icon name="ph:sun" size="18"></Icon>
          </UiButton>
          <UiButton
            variant="ghost"
            class="px-2"
            :style="{ color: contrastMode === 'dark' ? formatHsl(themeColor) : '' }"
            @click="contrastMode = 'dark'"
          >
            <Icon name="ph:moon" size="18"></Icon>
          </UiButton>
          <div class="flex-1"></div>
          <UiButton
            variant="ghost"
            class="px-2"
            @click="resetColor"
          >
            <Icon name="ph:info" size="18"></Icon>
          </UiButton>
        </div>
        <CommonRuler :min="minContrast" :max="maxContrast" class="pb-4" />
        <div v-if="suggestionMap" class="max-w-[50vw] sm:max-w-[70vw] md:max-w-[60vw] overflow-y-hidden pb-2 pr-2 flex flex-col justify-center">
          <div v-for="contrast of suggestionMap.contrasts" :key="contrast" class="flex">
            <div v-for="(color, i) of suggestionMap.colors[contrast]" :key="i">
              <div
                class="w-2 h-2 relative group" :style="{ backgroundColor: formatHsl(color) }"
                @mouseover="hoveredColor = color"
                @mouseleave="hoveredColor = undefined"
                @click="() => selectColor(color)"
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
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
