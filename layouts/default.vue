<script setup lang="ts">
</script>

<template>
  <div>
    <div class="container">
      <header
        class="my-10 text-gray-700 dark:text-foreground md:container"
      >
        <nav class="flex gap-8 justify-center align-middle items-center h-9">
          <NuxtLink to="/" class="hover:text-gray-900 dark:hover:text-gray-400 px-4 py-4 hidden sm:block">Home</NuxtLink>
          <NuxtLink to="/generator" class="hover:text-gray-900 dark:hover:text-gray-400 px-4 py-4">Generator</NuxtLink>
          <NuxtLink external to="https://ko-fi.com/samuelbraun" target="_blank" class="hover:text-gray-900 dark:hover:text-gray-400 px-4 py-4">Support</NuxtLink>
        </nav>
      </header>
      <main class="min-h-[calc(100vh-207px)] md:container flex flex-col justify-center">
        <!-- TODO: Remove nonesense min-h when more content -->
        <slot />
      </main>
      <footer>
        <div class="md:container mx-auto py-8">
          <div class="flex justify-between items-center gap-4 text-muted-foreground">
            <div class="items-center gap-2 md:flex hidden">
              <span class="text-sm">&copy; 2025 Webry</span>
            </div>

            <div class="flex gap-8 text-sm">
              <NuxtLink to="/legal/privacy" class="hover:text-gray-900 dark:hover:text-gray-300">
                Privacy
              </NuxtLink>
              <NuxtLink to="/legal/terms" class="hover:text-gray-900 dark:hover:text-gray-300">Terms</NuxtLink>
            </div>

            <div class="flex gap-6">
              <NuxtLink to="https://dev.to/samuel-braun" target="_blank" aria-label="Dev.to">
                <Icon name="simple-icons:devdotto" size="20px" class="hover:text-gray-800 dark:hover:text-gray-300" />
              </NuxtLink>
              <NuxtLink to="https://github.com/web-dev-sam/color-wizard" target="_blank" aria-label="GitHub">
                <Icon name="simple-icons:github" size="20px" class="hover:text-gray-800 dark:hover:text-gray-300" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
