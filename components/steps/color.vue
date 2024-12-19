<script setup lang="ts">
import { converter, formatHex, formatHsl, type Hsl, wcagContrast } from "culori"

const toXyb = converter("xyb")
const colorInput = ref("#0d1117")// "#0d1117")
const colorIsValid = computed(() => formatHsl(colorInput.value) !== undefined)
const selectedColor = ref<Hsl | undefined>(undefined)
const hoveredColor = ref<Hsl | undefined>(undefined)
const themeColor = computed(() => selectedColor.value ?? toHsl(colorInput.value))
const themeColorContrast = computed(() => themeColor.value ? wcagContrast(themeColor.value, lrgbWhite) : 21)
const themeBgFgCss = computed(() => ({
  backgroundColor: formatHsl(themeColor.value),
  color: themeColorContrast.value < 4.5 ? "#111" : "#fff",
}))

const contrastColors = computed(
  () => def(findHSLColorsWithContrast(colorInput.value, 12, 4.5, 0.1, 0.7),
    {
      ColorParserError: [] as Hsl[],
    },
  ),
)
const passingContrastColors = computed(() => contrastColors.value.data.filter(c => wcagContrast(c, lrgbWhite) >= 4.5))
const failingContrastColors = computed(() => contrastColors.value.data.filter(c => wcagContrast(c, lrgbWhite) < 4.5))
const passingSuggestionMap = computed(() => createColorMap(passingContrastColors.value))
const failingSuggestionMap = computed(() => createColorMap(failingContrastColors.value))

function createColorMap(colors: Hsl[]): Hsl[][] {
  // console.time("createColorMap")
  const sortedColors = [...colors].sort((a, b) => (a.h ?? 0) - (b.h ?? 0))
  const colorMap: Hsl[][] = []
  let currentHue = 0
  let currentRow: Hsl[] = []

  sortedColors.forEach((color) => {
    if (Math.abs((color.h || 0) - currentHue) > 1) {
      if (currentRow.length > 0) {
        colorMap.push(currentRow.sort((a, b) => toXyb(b).b - toXyb(a).b))
      }
      currentRow = [color]
      currentHue = color.h || 0
    } else {
      currentRow.push(color)
    }
  })

  // Add the last row if it's not empty
  if (currentRow.length > 0) {
    colorMap.push(currentRow.sort((a, b) => toXyb(b).b - toXyb(a).b))
  }

  // console.timeEnd("createColorMap")
  return colorMap
}

function selectColor(c: Hsl | undefined) {
  // console.log(c)
  selectedColor.value = c
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
      <UiInput v-model="colorInput" class="inline-block" type="text" placeholder="1" :style="{ '--ring': formatHsl(colorInput) }" />
      <UiButton
        v-if="colorIsValid"
        :style="{ ...themeBgFgCss }"
      >
        Select
      </UiButton>
      <span class="px-2 text-gray-600 dark:text-gray-400">
        {{ formatHex(themeColor) }}
      </span>
    </div>
    <div class="flex justify-center gap-2 mt-4 text-gray-600 dark:text-gray-400">
      <UiBadge variant="outline" class="text-sm" :style="{ borderColor: themeBgFgCss.backgroundColor }">
        WCAG Contrast: {{ themeColorContrast.toFixed(2) }} ({{ themeColorContrast < 7 ? themeColorContrast < 4.5 ? 'Fail' : 'AA' : 'AAA' }})
      </UiBadge>
    </div>

    <!-- Color Display -->
    <div class="flex justify-evenly">
      <div class="mt-24">
        <div>
          Failing
        </div>
        <div v-if="colorIsValid && contrastColors.success" class="flex gap-[0px] justify-center">
          <div v-for="(xcs, i) of failingSuggestionMap" :key="i" class="flex flex-col gap-[0px]">
            <div v-for="(color, j) of xcs" :key="j">
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
      <div class="mt-24">
        <div>
          Passing WCAG AA(A)
        </div>
        <div v-if="colorIsValid && contrastColors.success" class="flex gap-[0px] justify-center">
          <div v-for="(xcs, i) of passingSuggestionMap" :key="i" class="flex flex-col gap-[0px]">
            <div v-for="(color, j) of xcs" :key="j">
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
