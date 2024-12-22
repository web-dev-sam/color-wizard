<script setup lang="ts">
import { formatCss, formatHex, formatHsl, formatRgb, type Hsl } from "culori"

const contrastRangeMode = ref<"aa" | "aaa" | "aa3+">("aa")
const minContrast = computed(() => ({
  "aa3+": 3,
  "aa": 4.5,
  "aaa": 7,
}[contrastRangeMode.value]))
const maxContrast = computed(() => minContrast.value + 0.3)
const inputColor = ref("#6363e3")
const inputColorValid = computed(() => formatHsl(inputColor.value) !== undefined)
const selectedColor = ref<Hsl | undefined>(undefined)

// const contrastColors = computed(
//   () => def(findHSLColorsWithContrast(inputColor.value, 24, minContrast.value, maxContrast.value, 0.7),
//     {
//       ColorParserError: undefined,
//     },
//   ),
// )
// const suggestionMap = computed(() => contrastColors.value.data ? createColorMap(contrastColors.value.data) : undefined)
// const backgroundColor = hsl({ h: 0.2, s: 0.14, l: 0.04, mode: "hsl" })

// function _createColorMap(colors: Hsl[]) {
//   type WCAGContrastKey = string & { __wcagContrastKey: never }
//   const hueSort = (a: Hsl, b: Hsl) => (a.h ?? 0) - (b.h ?? 0)
//   const groupWcag = (colors: Hsl[]) => groupBy<WCAGContrastKey, Hsl>(colors, c => wcagContrast(c, lrgbWhite).toFixed(2) as WCAGContrastKey)

//   const wcagGroupedColors = groupWcag(colors)
//   for (let i = minContrast.value; i <= maxContrast.value; i += 0.01) {
//     if (!wcagGroupedColors[i.toFixed(2) as WCAGContrastKey]) {
//       wcagGroupedColors[i.toFixed(2) as WCAGContrastKey] = [backgroundColor]
//     }
//   }

//   const getDifference = (c: Hsl) => differenceEuclidean()(c, inputColor.value)
//   let autoSelectedColor: Hsl | undefined
//   let autoSelectedColorDifference = Infinity
//   for (const [_contrast, contrastColors] of Object.entries(wcagGroupedColors)) {
//     contrastColors.sort(hueSort)
//     for (const color of contrastColors) {
//       const difference = getDifference(color)
//       if (difference < autoSelectedColorDifference && color !== backgroundColor) {
//         autoSelectedColor = color
//         autoSelectedColorDifference = difference
//       }
//     }
//   }
//   if (autoSelectedColor) {
//     selectColor(autoSelectedColor)
//   }

//   return {
//     contrasts: Object
//       .keys(wcagGroupedColors)
//       .sort((a, b) => Number.parseFloat(b) - Number.parseFloat(a)) as (keyof typeof wcagGroupedColors)[],
//     colors: wcagGroupedColors,
//     autoSelectedColor,
//   }
// }

function resetColor() {
  // selectedColor.value = suggestionMap.value?.autoSelectedColor ? suggestionMap.value?.autoSelectedColor : undefined
}

// function selectColor(color: Hsl | undefined) {
//   selectedColor.value = color
// }
</script>

<template>
  <div class="container text-center mt-32">
    <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
      Choose your base color.
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-24 leading-relaxed max-w-[60ch] mx-auto">
      This is the base of your palette. For light themes, it will be color 600. For dark themes, you can use this as color 600 to get more light shades.
    </p>

    <div class="flex justify-center items-center gap-2">
      <UiButton
        v-if="inputColorValid"
        variant="ghost"
        class="px-2"
        @click="resetColor"
      >
        <Icon name="ph:repeat" size="18"></Icon>
      </UiButton>
      <UiInput v-model="inputColor" class="inline-block text-center" type="text" placeholder="#B000BA" :style="{ '--ring': inputColorValid ? formatHsl(inputColor) : 'red', 'border-red-500': !inputColorValid }" />
      <CommonWcagStatus :color="inputColor" :contrast-range="[minContrast, maxContrast]" />
    </div>

    <!-- Color Display -->
    <div class="mt-4 flex justify-evenly">
      <div v-if="!inputColorValid" class="text-gray-600 dark:text-gray-400 w-[50ch] leading-8">
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
      <div v-else>
        <p class="mt-12 text-gray-600 dark:text-gray-400 mb-2">
          Select a color below that passes WCAG contrast guidelines:
        </p>
        <div class="flex gap-4 pt-2 pb-4 pr-2">
          <div class="flex gap-2 w-10 pb-2 flex-col items-center text-gray-600 dark:text-gray-400">
            <div class="tracking-tight text-sm pointer-events-none">
              WCAG
            </div>
            <div class="flex-1"></div>
            <UiButton
              variant="ghost"
              class="px-2 py-0"
              :class="cn({ 'bg-neutral-800 text-white': contrastRangeMode === 'aa' })"
              @click="contrastRangeMode = 'aa'"
            >
              AA
            </UiButton>
            <UiButton
              variant="ghost"
              class="px-2"
              :class="cn({ 'bg-neutral-800 text-white': contrastRangeMode === 'aaa' })"
              @click="contrastRangeMode = 'aaa'"
            >
              AAA
            </UiButton>
            <UiButton
              variant="ghost"
              class="px-2"
              :class="cn({ 'bg-neutral-800 text-white': contrastRangeMode === 'aa3+' })"
              @click="contrastRangeMode = 'aa3+'"
            >
              AA3+
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
          <div class="w-[50vw] sm:w-[70vw] md:w-[60vw] overflow-x-auto">
            <div class="!w-[2000px]" :style="{ height: `${31 * 14 / getDevicePixelRatio()}px` }">
              <TresCanvas
                clear-color="#111"
                class="ctr-canvas"
              >
                <CommonAcceleratedColorMap v-model="selectedColor" />
              </TresCanvas>
            </div>
          </div>
        </div>
        <div v-if="selectedColor" class="mt-10 space-y-16">
          <div class="flex gap-4 items-center justify-center">
            <UiButton
              v-if="inputColorValid"
              :style="{
                backgroundColor: formatHsl(selectedColor),
                color: '#fff',
              }"
            >
              Continue with <span class="ml-2 font-mono">{{ formatHex(selectedColor) }}</span>
            </UiButton>
            <CommonWcagStatus :color="selectedColor" :contrast-range="[minContrast, maxContrast]" />
          </div>

          <div>
            <div class="flex gap-4 justify-center">
              <div
                class="flex items-center"
              >
                <code>{{ formatHex(selectedColor) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(formatHex(selectedColor))"
                >
                  <Icon name="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
              <div
                class="flex items-center"
              >
                <code>{{ formatHsl(selectedColor) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(formatHsl(selectedColor))"
                >
                  <Icon name="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
              <div
                class="flex items-center"
              >
                <code>{{ formatRgb(selectedColor) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(formatRgb(selectedColor))"
                >
                  <Icon name="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
            </div>
            <div class="flex gap-4 justify-center">
              <div
                class="flex items-center"
              >
                <code>{{ roundNumbersInString(formatCss(toOklab(selectedColor)), 4) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(roundNumbersInString(formatCss(toOklab(selectedColor)), 4))"
                >
                  <Icon name="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
              <div
                class="flex items-center"
              >
                <code>{{ roundNumbersInString(formatCss(toOklch(selectedColor)), 4) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(roundNumbersInString(formatCss(toOklch(selectedColor)), 4))"
                >
                  <Icon name="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
