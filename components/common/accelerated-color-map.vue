<script lang="ts" setup>
import { useTresContext } from "@tresjs/core"
import { type Hsl, wcagContrast } from "culori"
import * as THREE from "three"
import fragmentShader from "../shaders/contrast-color-map.frag?raw"
import vertexShader from "../shaders/contrast-color-map.vert?raw"

const { sizes } = useTresContext()

const groupedColors = shallowRef<Record<string, Hsl[]> | undefined>(undefined)
const selectedColor = defineModel<Hsl | undefined>({ required: true })

const uniforms = ref({
  u_resolution: { value: new THREE.Vector2(1, 1) },
  u_time: { value: 0 },
  u_color: { value: new THREE.Vector4(0x63 / 255, 0x63 / 255, 0xe3 / 255, 1) },
  u_minContrast: { value: 4.5 },
  u_maxContrast: { value: 4.8 },
  u_colorPalette: { value: null as THREE.DataTexture | null },
  u_paletteSize: { value: new THREE.Vector2(1, 1) },
  u_boxSize: { value: 14 },
  u_hoveredColor: { value: new THREE.Vector2(-1, -1) },
  u_hoverScale: { value: 1.2 },
})

const calculateColors = () => {
  const baseColor = new THREE.Color(uniforms.value.u_color.value.x, uniforms.value.u_color.value.y, uniforms.value.u_color.value.z)
  const colors = findHSLColorsWithContrast(
    { r: baseColor.r, g: baseColor.g, b: baseColor.b, mode: "rgb" },
    24,
    uniforms.value.u_minContrast.value,
    uniforms.value.u_maxContrast.value,
    0.7,
  )
  if (!colors.success) {
    return
  }

  const wcagGroupedColors: Record<string, Hsl[]> = {}
  for (let i = uniforms.value.u_minContrast.value; i <= uniforms.value.u_maxContrast.value; i += 0.01) {
    wcagGroupedColors[i.toFixed(2)] = []
  }

  colors.data.forEach((color) => {
    const contrast = wcagContrast(color, lrgbWhite).toFixed(2)
    if (wcagGroupedColors[contrast]) {
      wcagGroupedColors[contrast].push(color)
    }
  })

  // Sort colors within each contrast group by hue
  Object.values(wcagGroupedColors).forEach((group) => {
    group.sort((a, b) => (a.h ?? 0) - (b.h ?? 0))
  })

  return wcagGroupedColors
}

const createColorPaletteTexture = (groupedColors: Record<string, Hsl[]>) => {
  const contrasts = Object.keys(groupedColors).sort((a, b) => Number(b) - Number(a))
  const maxColorsInRow = Math.max(...contrasts.map(c => groupedColors[c].length))

  const width = maxColorsInRow
  const height = contrasts.length
  const data = new Uint8Array(width * height * 4)

  contrasts.forEach((contrast, y) => {
    groupedColors[contrast].forEach((color, x) => {
      const rgb = toRGB(color)
      const index = (y * width + x) * 4
      data[index] = Math.floor(rgb.r * 255)
      data[index + 1] = Math.floor(rgb.g * 255)
      data[index + 2] = Math.floor(rgb.b * 255)
      data[index + 3] = 255 // Alpha
    })
  })

  const texture = new THREE.DataTexture(
    data,
    width,
    height,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  )
  texture.needsUpdate = true
  return { texture, width, height }
}

const updateHoveredColor = (event: MouseEvent) => {
  const x = event.offsetX
  const y = event.offsetY

  // Convert to normalized device coordinates
  const ndcX = (x * getDevicePixelRatio() / (uniforms.value.u_paletteSize.value.x * uniforms.value.u_boxSize.value)) * 2 - 1
  const ndcY = -(y / sizes.height.value) * 2 + 1

  // Convert to grid coordinates
  const gridX = Math.floor((ndcX + 1) / 2 * uniforms.value.u_paletteSize.value.x)
  const gridY = Math.floor((ndcY + 1) / 2 * uniforms.value.u_paletteSize.value.y)

  // Update the hovered color uniform
  if (gridX >= 0 && gridX < uniforms.value.u_paletteSize.value.x
    && gridY >= 0 && gridY < uniforms.value.u_paletteSize.value.y) {
    uniforms.value.u_hoveredColor.value.set(gridX, gridY)
    if (!groupedColors.value) {
      return
    }
    // Get the actual color from the grouped colors
    const contrasts = Object.keys(groupedColors.value).sort((a, b) => Number(b) - Number(a))
    const contrast = contrasts[gridY]
    const color = groupedColors.value[contrast][gridX]

    selectedColor.value = color
  } else {
    uniforms.value.u_hoveredColor.value.set(-1, -1)
  }
}

const setupScene = () => {
  groupedColors.value = calculateColors()
  if (!groupedColors.value) {
    return
  }

  const { texture, width, height } = createColorPaletteTexture(groupedColors.value)
  uniforms.value.u_colorPalette.value = texture
  uniforms.value.u_paletteSize.value = new THREE.Vector2(width, height)
}

onMounted(() => {
  setupScene();
  (document.querySelector(".ctr-canvas") as HTMLCanvasElement)?.addEventListener("mousemove", updateHoveredColor)
})

onUnmounted(() => {
  (document.querySelector(".ctr-canvas") as HTMLCanvasElement)?.removeEventListener("mousemove", updateHoveredColor)
})
</script>

<template>
  <TresOrthographicCamera
    :position="[0, 0, 1]"
  />
  <TresMesh>
    <TresPlaneGeometry :args="[sizes.width.value, sizes.height.value]" />
    <TresShaderMaterial
      :vertex-shader="vertexShader"
      :fragment-shader="fragmentShader"
      :uniforms="uniforms"
    />
  </TresMesh>
</template>
