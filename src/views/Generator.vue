<script setup lang="ts">
import { ref } from "vue"
import StepsColor from "../components/steps/color.vue"

const currentStep = ref(0)
</script>

<template>
  <div>
    <StepsColor v-if="currentStep === 0" />
  </div>
</template>

<style scoped></style>
