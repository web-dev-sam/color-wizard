<script setup lang="ts">
import { formatHsl, type Hsl } from "culori"

definePageMeta({
  layout: "blank",
})

// type MixMode = "oklch-linear" | "oklab-linear" | "rgb-linear" | "hsl-linear" | "hsl-auto"

const colorAInput = ref("#f1f5f9")// "#0d1117")
const colorBInput = ref("#0f172a") // "#822ce1")
// const mixMode = ref<MixMode>("hsl-linear")
// const steps = ref(9)

// console.log(distanceRGB("#fff", "#000"))

// const generatedColors: ComputedRef<Ok<string[]>> = computed(() => {
//   const defaultColors = [] as string[]

//   switch (mixMode.value) {
//     case "oklch-linear":
//       return def(mixOklchLinear(colorAInput.value, colorBInput.value, steps.value), {
//         ColorParserError: defaultColors,
//       })
//     case "oklab-linear":
//       return def(mixOklabLinear(colorAInput.value, colorBInput.value, steps.value), {
//         ColorParserError: defaultColors,
//       })
//     case "rgb-linear":
//       return def(mixRgbLinear(colorAInput.value, colorBInput.value, steps.value), {
//         ColorParserError: defaultColors,
//       })
//     case "hsl-linear":
//       return def(mixHslLinear(colorAInput.value, colorBInput.value, steps.value), {
//         ColorParserError: defaultColors,
//       })
//     case "hsl-auto":
//       return def(mixHslAuto(colorAInput.value, colorBInput.value, steps.value), {
//         ColorParserError: defaultColors,
//       })
//     default:
//       // eslint-disable-next-line no-case-declarations
//       const _exhaustiveCheck: never = mixMode.value
//       return ok(defaultColors)
//   }
// })
// const differenceToTailwindColors = computed(() => {
//   const tailColors = [
//     "#f1f5f9",
//     "#e2e8f0",
//     "#cbd5e1",
//     "#94a3b8",
//     "#64748b",
//     "#475569",
//     "#334155",
//     "#1e293b",
//     "#0f172a",
//   ]
//   console.log("formatHsl", tailColors.map(c => formatHsl(c)))
//   console.log("getPerceivedBrightnessOklab", tailColors.map(c => getPerceivedBrightnessOklab(c)))
//   console.log("getPerceivedBrightnessAvgDiffs", getPerceivedBrightnessAvgDiffs(tailColors))
//   const genColors = generatedColors.value.data
//   return tailColors.map((color, i) => differenceEuclidean("rgb")(color, genColors[i])).map(d => d.toFixed(2))
// })
// rgb-linear: ['0.00', '0.10', '0.16', '0.06', '0.13', '0.15', '0.10', '0.07', '0.00']
// oklab-linear: ['0.00', '0.13', '0.20', '0.08', '0.08', '0.09', '0.05', '0.04', '0.00']
// oklch-linear: ['0.00', '0.13', '0.20', '0.08', '0.07', '0.09', '0.05', '0.04', '0.00']
// hsl-linear: ['0.00', '0.11', '0.18', '0.12', '0.21', '0.22', '0.14', '0.09', '0.00']
// watchEffect(() => console.log(differenceToTailwindColors.value))

// console.log("map", findHSLColorsWithContrast("#475569", 12, 4.5, 0.01, 0.01))
const contrastColors = findHSLColorsWithContrast("#3d619f", 12, 4.5, 0.01, 0.7) as Ok<Hsl[]>
function createColorMap(colors: Hsl[]): Hsl[][] {
  // Sort colors by lightness (y-axis) in descending order
  const sortedColors = [...colors].sort((a, b) => b.l - a.l)

  // Create a 2D array where each row represents a unique lightness value
  const colorMap: Hsl[][] = []
  let currentLightness = -1
  let currentRow: Hsl[] = []

  sortedColors.forEach((color) => {
    if (color.l !== currentLightness) {
      if (currentRow.length > 0) {
        colorMap.push(currentRow.sort((a, b) => (a.h ?? 0) - (b.h ?? 0)))
      }
      currentRow = [color]
      currentLightness = color.l
    } else {
      currentRow.push(color)
    }
  })

  // Add the last row if it's not empty
  if (currentRow.length > 0) {
    colorMap.push(currentRow.sort((a, b) => (a.h ?? 0) - (b.h ?? 0)))
  }

  return colorMap
}
</script>

<template>
  <div>
    <!-- Color Picker -->
    <div class="container mx-auto mt-24">
      <div class="flex flex-col gap-4">
        <div class="flex gap-4">
          <input v-model="colorAInput" type="text" placeholder="1" class="p-2 border bg-gray-900 rounded-md" />
          <input v-model="colorBInput" type="text" placeholder="2" class="p-2 border bg-gray-900 rounded-md" />
        </div>
      </div>
    </div>

    <!-- Color Display -->
    <!-- <div class="container mx-auto mt-24">
      <div class="flex flex-col gap-4">
        <div class="flex gap-4">
          <div v-for="(color, i) of generatedColors.data" :key="i">
            <div class="w-20 h-20" :style="{ backgroundColor: color }"></div>
            <div>{{ formatHex(color) }}</div>
            <div>{{ formatHsl(color) }}</div>
            <div>{{ formatRgb(color) }}</div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- Color Display -->
    <div v-if="contrastColors.success" class="container mx-auto mt-24 flex gap-[1px]">
      <div v-for="(xcs, i) of createColorMap(contrastColors.data)" :key="i" class="flex flex-col gap-[1px]">
        <div v-for="(color, j) of xcs" :key="j">
          <div class="w-4 h-4" :style="{ backgroundColor: formatHsl(color) }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
