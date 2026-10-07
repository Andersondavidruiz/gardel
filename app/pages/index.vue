<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 p-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <!-- Logo y cabecera -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-orange-500 text-white font-black text-2xl rounded-2xl shadow-lg mb-3">
            G
          </div>
          <h1 class="text-2xl font-black text-slate-800 tracking-tight">GARDEL</h1>
          <p class="text-sm text-slate-500 font-medium">Sistema de Gestión Web & Punto de Venta</p>
        </div>

        <!-- Alerta de Error -->
        <div
          v-if="errorMessage"
          class="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2"
          role="alert"
        >
          <svg class="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Formulario -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label for="cc" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Número de Cédula
            </label>
            <input
              id="cc"
              v-model="identificacion"
              type="text"
              required
              placeholder="Ingresa tu cédula"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 text-sm font-medium"
            />
          </div>

          <div>
            <label for="pin" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              PIN / Contraseña
            </label>
            <input
              id="pin"
              v-model="pin"
              type="password"
              required
              placeholder="Ingresa tu PIN"
              class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            :disabled="cargando"
            class="w-full mt-2 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <svg
              v-if="cargando"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ cargando ? 'Ingresando...' : 'Ingresar al Sistema' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        © {{ new Date().getFullYear() }} Sistema Gardel - Todos los derechos reservados
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { setUsuario } = useAuth()

const identificacion = ref('')
const pin = ref('')
const cargando = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!identificacion.value.trim() || !pin.value.trim()) {
    errorMessage.value = 'Por favor ingresa tu número de cédula y PIN.'
    return
  }

  cargando.value = true
  errorMessage.value = ''

  try {
    const res: any = await $fetch(`${apiUrl}/AuthController.php`, {
      method: 'POST',
      body: {
        identificacion: identificacion.value.trim(),
        pin: pin.value.trim()
      }
    })

    if (res && res.status === true) {
      const datosUsuario = res.data || res.usuario || {
        id: 1,
        identificacion: identificacion.value.trim()
      }
      setUsuario(datosUsuario)
      navigateTo('/sedes')
    } else {
      errorMessage.value = res?.message || 'Identificación o PIN incorrectos.'
    }
  } catch (err: any) {
    console.error('Error login:', err)
    errorMessage.value = err?.data?.message || err?.message || 'Error de conexión con el servidor.'
  } finally {
    cargando.value = false
  }
}
</script>

