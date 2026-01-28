<script lang="ts" setup>
import type { Hsl } from "culori"
import { useTresContext } from "@tresjs/core"
import { differenceEuclidean, wcagContrast } from "culori"
import { DataTexture, RGBAFormat, UnsignedByteType, Vector2 } from "three"
import { computed, ref, watch } from "vue"
import { findHSLColorsWithContrast, lrgbWhite, toRGB } from "../../utils/colors"
import { getDevicePixelRatio } from "../../utils/utils"
import fragmentShader from "../shaders/contrast-color-map.frag?raw"
import vertexShader from "../shaders/contrast-color-map.vert?raw"

const props = defineProps<{ inputColor: string, minContrast: number, maxContrast: number }>()

const { sizes } = useTresContext()
const selectedColorVModel = defineModel<Hsl | undefined>({ required: true })

const uniforms = ref({
  u_resolution: { value: new Vector2(1, 1) },
  u_time: { value: 0 },
  u_colorPalette: { value: null as DataTexture | null },
  u_paletteSize: { value: new Vector2(1, 1) },
  u_boxSize: { value: 14 },
  u_hoveredColor: { value: new Vector2(-1, -1) },
  u_selectedColor: { value: new Vector2(-1, -1) },
})

const inputColorRGB = computed(() => toRGB(props.inputColor))
const groupedColors = computed(() => {
  if (!inputColorRGB.value) {
    return
  }

  const colors = findHSLColorsWithContrast(
    inputColorRGB.value,
    24,
    props.minContrast,
    props.maxContrast,
    0.7,
  )
  if (!colors.success) {
    return
  }

  const wcagGroupedColors: Record<string, Hsl[]> = {}
  for (let i = props.minContrast; i <= props.maxContrast; i += 0.01) {
    wcagGroupedColors[i.toFixed(2)] = []
  }

  let inputSimilarity = -Infinity
  let aSelectedColor: Hsl | undefined
  colors.data.forEach((color) => {
    const contrast = wcagContrast(color, lrgbWhite).toFixed(2)
    if (wcagGroupedColors[contrast]) {
      wcagGroupedColors[contrast].push(color)
    }

    const similarity = -differenceEuclidean("hsl")(color, props.inputColor)
    if (similarity > inputSimilarity) {
      inputSimilarity = similarity
      aSelectedColor = color
    }
  })

  Object.values(wcagGroupedColors).forEach((group) => {
    group.sort((a, b) => (a.h ?? 0) - (b.h ?? 0))
  })

  return {
    autoSuggestedColor: aSelectedColor,
    colorMap: wcagGroupedColors,
  }
})
const colorPaletteTexture = computed(() => {
  if (!groupedColors.value) {
    return
  }

  const { colorMap } = groupedColors.value
  const contrasts = Object.keys(colorMap).sort((a, b) => Number(a) - Number(b))
  const maxColorsInRow = Math.max(...contrasts.map(c => colorMap[c].length))

  const width = maxColorsInRow
  const height = contrasts.length
  const data = new Uint8Array(width * height * 4)

  contrasts.forEach((contrast, y) => {
    colorMap[contrast].forEach((color, x) => {
      const rgb = toRGB(color)
      const index = (y * width + x) * 4
      data[index] = Math.floor(rgb.r * 255)
      data[index + 1] = Math.floor(rgb.g * 255)
      data[index + 2] = Math.floor(rgb.b * 255)
      data[index + 3] = 255 // Alpha
    })
  })

  const texture = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    UnsignedByteType,
  )
  texture.needsUpdate = true
  return { texture, width, height }
})

watch(() => colorPaletteTexture.value, () => {
  const texture = colorPaletteTexture.value
  if (!texture) {
    return
  }
  uniforms.value.u_colorPalette.value = texture.texture
  uniforms.value.u_paletteSize.value = new Vector2(texture.width, texture.height)

  resetColor()
}, { immediate: true })

function getHoveredGrid(event: MouseEvent) {
  const x = event.offsetX
  const y = event.offsetY

  // Convert to normalized device coordinates
  const ndcX = (x * getDevicePixelRatio() / (uniforms.value.u_paletteSize.value.x * uniforms.value.u_boxSize.value)) * 2 - 1
  const ndcY = (y / sizes.height.value) * 2 - 1

  // Convert to grid coordinates
  const gridX = Math.floor((ndcX + 1) / 2 * uniforms.value.u_paletteSize.value.x)
  const gridY = Math.floor((ndcY + 1) / 2 * uniforms.value.u_paletteSize.value.y)

  if (gridX >= 0 && gridX < uniforms.value.u_paletteSize.value.x
    && gridY >= 0 && gridY < uniforms.value.u_paletteSize.value.y) {
    return { gridX, gridY }
  } else {
    return { gridX: -1, gridY: -1 }
  }
}

function updateHoveredColor(event: MouseEvent) {
  const { gridX, gridY } = getHoveredGrid(event)
  if (gridX === -1 || gridY === -1) {
    return
  }

  uniforms.value.u_hoveredColor.value.set(gridX, gridY)
}

function updateSelectedColor(event: MouseEvent) {
  const { gridX, gridY } = getHoveredGrid(event)
  if (gridX === -1 || gridY === -1) {
    return
  }

  if (!groupedColors.value) {
    return
  }
  const contrasts = Object.keys(groupedColors.value.colorMap).sort((a, b) => Number(b) - Number(a))
  const contrast = contrasts[gridY]
  const color = groupedColors.value.colorMap[contrast][gridX]

  uniforms.value.u_selectedColor.value.set(gridX, gridY)
  selectedColorVModel.value = color
}

function resetColor() {
  if (!groupedColors.value) {
    return
  }

  const { autoSuggestedColor, colorMap } = groupedColors.value
  if (!autoSuggestedColor) {
    return
  }
  selectedColorVModel.value = autoSuggestedColor

  let xIndex = -1
  const colorMapKeys = Object.keys(colorMap)
  for (let lineIndex = 0; lineIndex < colorMapKeys.length; lineIndex++) {
    const line = colorMap[colorMapKeys[lineIndex]]
    xIndex = line.findIndex(color => color === autoSuggestedColor)
    if (xIndex !== -1) {
      uniforms.value.u_selectedColor.value.set(xIndex, lineIndex)
      break
    }
  }

  const scrollX = xIndex * uniforms.value.u_boxSize.value
  const scrollableElement = document.querySelector(".ctr-scrollable")
  if (!scrollableElement) {
    return
  }

  scrollableElement.scrollTo({ left: scrollX - scrollableElement.clientWidth / 2, behavior: "smooth" })
}

defineExpose({
  resetColor,
})
</script>

<template>
  <TresOrthographicCamera
    :position="[0, 0, 1]"
  />
  <TresMesh
    @pointer-move="updateHoveredColor"
    @click="updateSelectedColor"
  >
    <TresPlaneGeometry :args="[sizes.width.value, sizes.height.value]" />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
    />
  </TresMesh>
</template>
