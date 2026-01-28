<script setup lang="ts">
import { ToastProvider, TooltipProvider } from "radix-vue"
import Toaster from "./components/ui/toast/Toaster.vue"
</script>

<template>
  <div id="app">
    <TooltipProvider>
      <ToastProvider>
        <router-view />
        <Toaster />
      </ToastProvider>
    </TooltipProvider>
  </div>
</template>

<style scoped>
/* App styles */
</style>
