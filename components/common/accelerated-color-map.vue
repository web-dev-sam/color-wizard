<script lang="ts" setup>
import { useTresContext } from "@tresjs/core"
import fragmentShader from "../shaders/contrast-color-map.frag?raw"
import vertexShader from "../shaders/contrast-color-map.vert?raw"

const { sizes } = useTresContext()

const uniforms = ref({
  u_resolution: { value: [1, 1] },
  u_time: { value: 0 },
  u_gridSize: { value: 10 },
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
