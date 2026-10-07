<template>
  <header class="bg-slate-800 text-white p-4 flex flex-wrap justify-between items-center shadow-md gap-3">
    <div class="flex items-center gap-3">
      <NuxtLink to="/pedidos" class="text-xl font-bold tracking-tight text-white hover:text-orange-400 transition flex items-center gap-2">
        <span class="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-extrabold">GARDEL</span>
        <span>{{ titulo || 'Sistema POS' }}</span>
      </NuxtLink>
    </div>

    <div class="flex flex-wrap items-center gap-4 text-sm">
      <div class="flex items-center gap-4 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
        <div>
          <span class="text-slate-400 text-xs block">Sede</span>
          <span class="font-bold text-emerald-400">{{ sedeNombre }}</span>
        </div>
        <div class="border-l border-slate-700 pl-4">
          <span class="text-slate-400 text-xs block">Cajero</span>
          <span class="font-bold text-slate-200">{{ cajeroNombre }}</span>
        </div>
      </div>

      <!-- Accesos a módulos -->
      <nav class="flex items-center gap-2">
        <NuxtLink
          to="/pedidos"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          :class="$route.path === '/pedidos' ? 'bg-orange-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Pedido
        </NuxtLink>

        <NuxtLink
          to="/comandas"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          :class="$route.path === '/comandas' ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          Comandas
        </NuxtLink>

        <NuxtLink
          to="/gaseosas"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          :class="$route.path === '/gaseosas' ? 'bg-amber-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          Gaseosas
        </NuxtLink>

        <NuxtLink
          to="/traslados"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          :class="$route.path === '/traslados' ? 'bg-emerald-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-200'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Traslados
        </NuxtLink>

        <NuxtLink
          to="/sedes"
          class="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          title="Cambiar Sede"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          </svg>
          Cambiar Sede
        </NuxtLink>

        <button
          @click="handleLogout"
          class="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5"
          title="Cerrar sesión"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Salir
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  titulo?: string
}>()

const { usuario, logout, initAuth } = useAuth()
const { sedeActual, initSede } = useSede()

onMounted(() => {
  initAuth()
  initSede()
})

const sedeNombre = computed(() => {
  return sedeActual.value?.nombre || (usuario.value as any)?.sede_activa_nombre || (usuario.value as any)?.sede_nombre || 'Sede Principal'
})

const cajeroNombre = computed(() => {
  return usuario.value?.nombre || (usuario.value as any)?.identificacion || 'Cajero'
})

const handleLogout = () => {
  if (confirm('¿Deseas cerrar la sesión activa?')) {
    logout()
  }
}
</script>

