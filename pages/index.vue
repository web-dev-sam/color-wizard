<script lang="ts" setup>
// const { data } = useAPI("/products")
defineOgImageComponent("NuxtSeo", {
  title: "Nuxt SaaS Template",
  description: "A modern SaaS template that helps you launch your product in days, not months.",
  theme: "#00DA7F",
  colorMode: "dark",
})
</script>

<template>
  <div>
    <section class="transition-colors duration-200">
      <div class="container mx-auto px-4 -translate-y-16">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Generate and manipulate colors like its magic
          </h1>

          <p class="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
            With ColorWizard, you can easily generate the colors you want with excellence.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink to="/generator" class="group">
              <UiButton variant="primary" size="lg" class="bg-primary-500">
                Generate Colors
                <Icon name="ph:arrow-right" class="ml-2 group-hover:translate-x-1 transition-transform" size="18" />
              </UiButton>
              <p class="mt-4 text-gray-500">
                No account required
              </p>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
