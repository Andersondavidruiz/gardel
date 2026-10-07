<template>
  <div class="h-screen flex flex-col bg-gray-100 overflow-hidden">
    <CommonAppHeader />
    <main class="flex-1 overflow-hidden flex flex-col">
      <slot />
    </main>
  </div>
</template>

