<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-900 p-4">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
        <!-- Ícono decorativo -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl mb-3">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Seleccionar Sede de Trabajo</h2>
          <p class="text-xs text-slate-500 mt-1">Elige la sede sobre la cual registrarás o consultarás operaciones hoy.</p>
        </div>

        <!-- Alerta de Error -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2"
          role="alert"
        >
          <svg class="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleContinuar" class="space-y-5">
          <div>
            <label for="select-sede" class="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Sede Disponible
            </label>
            <div class="relative">
              <select
                id="select-sede"
                v-model="sedeSeleccionadaId"
                :disabled="cargandoSedes || procesando"
                required
                class="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition text-slate-800 text-sm font-medium appearance-none"
              >
                <option value="" disabled>{{ cargandoSedes ? 'Cargando sedes...' : '-- Selecciona una Sede --' }}</option>
                <option v-for="sede in sedes" :key="sede.id" :value="sede.id">
                  {{ sede.nombre }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            :disabled="procesando || !sedeSeleccionadaId"
            class="w-full mt-3 py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <svg
              v-if="procesando"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ textoBoton }}
          </button>
        </form>

        <div class="mt-5 text-center">
          <button
            @click="logout"
            type="button"
            class="text-xs text-slate-500 hover:text-red-600 font-semibold transition"
          >
            Cerrar sesión / Salir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sede } from '~/types/gardel'

definePageMeta({
  layout: 'auth'
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { usuario, logout, setUsuario, initAuth } = useAuth()
const { setSedeActiva } = useSede()

const sedes = ref<Sede[]>([])
const sedeSeleccionadaId = ref<string | number>('')
const cargandoSedes = ref(false)
const procesando = ref(false)
const errorMessage = ref('')
const textoBoton = ref('Continuar al Dashboard')

onMounted(async () => {
  initAuth()
  await cargarSedes()
})

const cargarSedes = async () => {
  cargandoSedes.value = true
  errorMessage.value = ''
  try {
    const res: any = await $fetch(`${apiUrl}/SedesController.php`)
    if (res && res.status === true && Array.isArray(res.data)) {
      sedes.value = res.data
    } else {
      // Fallback de sedes estándar si la base de datos está offline o vacía
      sedes.value = [
        { id: 1, nombre: 'Alamedas' },
        { id: 2, nombre: 'Nariño' },
        { id: 3, nombre: 'Urbina' },
        { id: 4, nombre: 'Bodega de Producción' }
      ]
    }
  } catch (err: any) {
    console.warn('API de sedes inaccesible, usando sedes por defecto:', err)
    sedes.value = [
      { id: 1, nombre: 'Alamedas' },
      { id: 2, nombre: 'Nariño' },
      { id: 3, nombre: 'Urbina' },
      { id: 4, nombre: 'Bodega de Producción' }
    ]
  } finally {
    cargandoSedes.value = false
  }
}

const handleContinuar = async () => {
  const sedeEncontrada = sedes.value.find(s => String(s.id) === String(sedeSeleccionadaId.value))
  if (!sedeEncontrada) {
    errorMessage.value = 'Por favor selecciona una sede para continuar.'
    return
  }

  procesando.value = true
  errorMessage.value = ''
  textoBoton.value = 'Verificando caja...'

  try {
    const usuarioActual = usuario.value || {}
    const idUsuarioValido = (usuarioActual as any).id || (usuarioActual as any).id_usuario || (usuarioActual as any).usuario_id || 1

    let cajaId: number | string = 1

    try {
      // 1. Consultar si existe una caja 'ABIERTA' en la sede
      const resCaja: any = await $fetch(`${apiUrl}/CajaController.php?sede_id=${sedeEncontrada.id}`)
      if (resCaja && resCaja.status === true && resCaja.caja_abierta === true) {
        cajaId = resCaja.data ? resCaja.data.id : (resCaja.caja_id || resCaja.id)
      } else {
        textoBoton.value = 'Abriendo caja...'
        // 2. Abrir caja si no hay una activa
        const resAbrir: any = await $fetch(`${apiUrl}/CajaController.php`, {
          method: 'POST',
          body: {
            action: 'abrir_caja',
            sede_id: sedeEncontrada.id,
            usuario_id: idUsuarioValido,
            monto_inicial: 0.00
          }
        })
        if (resAbrir && resAbrir.status === true) {
          cajaId = resAbrir.caja_id || (resAbrir.data ? resAbrir.data.id : resAbrir.id)
        }
      }
    } catch (cajaErr) {
      console.warn('Advertencia verificando caja con backend, usando ID de caja 1 por defecto:', cajaErr)
    }

    // 3. Guardar estado activo
    const usuarioActualizado = {
      ...usuarioActual,
      sede_id: sedeEncontrada.id,
      sede_nombre: sedeEncontrada.nombre,
      sede_activa_id: sedeEncontrada.id,
      sede_activa_nombre: sedeEncontrada.nombre,
      caja_activa_id: cajaId,
      caja_estado: 'ABIERTA'
    }

    setUsuario(usuarioActualizado as any)
    setSedeActiva(sedeEncontrada, cajaId)

    // Redirigir a ventas
    navigateTo('/pedidos')

  } catch (err: any) {
    errorMessage.value = err.message || 'Error al procesar la apertura de caja.'
  } finally {
    procesando.value = false
    textoBoton.value = 'Continuar al Dashboard'
  }
}
</script>

