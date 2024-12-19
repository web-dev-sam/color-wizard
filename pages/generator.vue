<script setup lang="ts">
definePageMeta({
  layout: "blank",
})

const currentStep = ref(0)
</script>

<template>
  <div>
    <StepsColor v-if="currentStep === 0" />
  </div>
</template>

<style scoped></style>
