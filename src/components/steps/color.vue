<script setup lang="ts">
import type { Hsl } from "culori"
import { Icon } from "@iconify/vue"
import { TresCanvas } from "@tresjs/core"
import { formatCss, formatHex, formatHsl, formatRgb, oklab, oklch } from "culori"
import { computed, defineAsyncComponent, ref, useTemplateRef } from "vue"
import { cn } from "../../utils/cn"
import { copy, getDevicePixelRatio, roundNumbersInString } from "../../utils/utils"
import CommonRuler from "../common/ruler.vue"
import CommonWcagStatus from "../common/wcag-status.vue"
import UiButton from "../ui/button/Button.vue"
import UiInput from "../ui/input/Input.vue"

const CommonAcceleratedColorMap = defineAsyncComponent(() => import("../common/accelerated-color-map.vue"))

const accColorMapRef = useTemplateRef("accelerated-color-map")
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

function resetColor() {
  accColorMapRef.value?.resetColor()
}

// function selectColor(color: Hsl | undefined) {
//   selectedColor.value = color
// }
</script>

<template>
  <div class="container mx-auto text-center mt-32">
    <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
      Choose your base color.
    </h1>
    <p class="text-lg text-gray-400 mb-24 leading-relaxed max-w-[60ch] mx-auto">
      This tool helps you fix WCAG contrast issues of your color by suggesting accessible alternatives. Just enter any color below.
    </p>

    <div class="flex justify-center items-center gap-2">
      <UiButton
        v-if="inputColorValid"
        variant="ghost"
        class="px-2"
        @click="resetColor"
      >
        <Icon icon="ph:repeat" size="18"></Icon>
      </UiButton>
      <UiInput v-model="inputColor" class="inline-block text-center" type="text" placeholder="#123456" :style="{ '--ring': inputColorValid ? formatHsl(inputColor) : 'red', 'border-red-500': !inputColorValid }" />
      <CommonWcagStatus :color="inputColor" :contrast-range="[minContrast, maxContrast]" />
    </div>

    <div>
      <div v-if="!inputColorValid" class="text-gray-600 dark:text-gray-400 w-[50ch] leading-8 mx-auto">
        <div class="mb-2 mt-24">Examples</div>
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = '#123456'">#123456</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = '#abc'">#abc</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'firebrick'">firebrick</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'hsl(0, 100%, 50%)'">hsl(0, 100%, 50%)</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'rgb(255 0 0)'">rgb(255 0 0)</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'rgba(255, 0, 0, 0.5)'">rgba(255, 0, 0, 0.5)</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'hwb(0 0 0)'">hwb(0 0 0)</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'lab(30% 40 20)'">lab(30% 40 20)</code>,
        <code class="hover:bg-neutral-800 cursor-pointer" role="button" @click="inputColor = 'lch(50% 10 250)'">lch(50% 10 250)</code>
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
              <Icon icon="ph:info" size="18"></Icon>
            </UiButton>
          </div>
          <CommonRuler :min="minContrast" :max="maxContrast" class="pb-6" />
          <div class="max-w-full min-w-0 pl-2.5 pt-2.5 pr-6 bg-neutral-900/50 rounded-r-3xl rounded-l-lg">
            <div class="ctr-scrollable overflow-x-auto pb-4">
              <div class="w-500!" :style="{ height: `${31 * 14 / getDevicePixelRatio()}px` }">
                <Suspense>
                  <TresCanvas
                    clear-color="#111"
                    class="ctr-canvas"
                  >
                    <CommonAcceleratedColorMap
                      ref="accelerated-color-map"
                      v-model="selectedColor"
                      :input-color="inputColor"
                      :min-contrast="minContrast"
                      :max-contrast="maxContrast"
                    />
                  </TresCanvas>
                  <template #fallback>
                    <div>Loading color map...</div>
                  </template>
                </Suspense>
              </div>
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

          <div class="space-y-4 pb-24">
            <div class="flex flex-wrap gap-4 justify-center">
              <div
                class="flex items-center"
              >
                <code class="whitespace-nowrap">{{ formatHex(selectedColor) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(formatHex(selectedColor))"
                >
                  <Icon icon="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
              <div
                class="flex items-center"
              >
                <code class="whitespace-nowrap">{{ formatHsl(selectedColor) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(formatHsl(selectedColor))"
                >
                  <Icon icon="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
              <div
                class="flex items-center"
              >
                <code class="whitespace-nowrap">{{ formatRgb(selectedColor) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(formatRgb(selectedColor))"
                >
                  <Icon icon="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
            </div>
            <div class="flex flex-wrap gap-4 justify-center">
              <div
                class="flex items-center"
              >
                <code class="whitespace-nowrap">{{ roundNumbersInString(formatCss(oklab(selectedColor)), 4) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(roundNumbersInString(formatCss(oklab(selectedColor)), 4))"
                >
                  <Icon icon="ph:copy" size="18"></Icon>
                </UiButton>
              </div>
              <div
                class="flex items-center"
              >
                <code class="whitespace-nowrap">{{ roundNumbersInString(formatCss(oklch(selectedColor)), 4) }}</code>
                <UiButton
                  v-if="inputColorValid"
                  variant="ghost"
                  class="px-2"
                  @click="copy(roundNumbersInString(formatCss(oklch(selectedColor)), 4))"
                >
                  <Icon icon="ph:copy" size="18"></Icon>
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
